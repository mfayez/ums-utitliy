chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "fetchCourses") {
        fetchCoursesFromPortal()
            .then(courses => sendResponse({ success: true, courses }))
            .catch(error => sendResponse({ success: false, error }));
        return true; // Indicates response will be sent asynchronously
    }

    if (message.type === "downloadFile") {
        chrome.downloads.download({
            url: message.fileUrl,
            filename: message.filename
        }, (downloadId) => {
            sendResponse({ success: true, downloadId });
        });
        return true;
    }
});

async function fetchCoursesFromPortal() {
    const baseServerUrl = "https://ums.asu.edu.eg:7090";
    
    try {
        // Step 1: Fetch control team options
        const controlTeamResponse = await fetch(`${baseServerUrl}/Backend/UnderGraduate/StudentCourseGrades/GetControlTeamsForUser`, {
            method: "GET",
            credentials: "include"
        });
        const controlTeamData = await controlTeamResponse.json();

        // Parse control teams
        const controlTeamOptions = controlTeamData.reduce((acc, item) => {
            acc[item.Id] = item.Name;
            return acc;
        }, {});

        const courses = [];

        // Step 2: Iterate over control teams to fetch courses
        for (const [controlTeamId, controlTeamName] of Object.entries(controlTeamOptions)) {
            const coursesResponse = await fetch(`${baseServerUrl}/Backend/UnderGraduate/StudentCourseGrades/GetAccessibleCoursesByControlTeamId?TeamId=${controlTeamId}`, {
                method: "GET",
                credentials: "include"
            });
            const coursesData = await coursesResponse.json();

            for (const course of coursesData) {
                const courseId = course.Id;
                const courseName = course.Name;
                const courseCode = course.Code || "N/A";

                // Step 3: Fetch exam types for each course
                const examTypesResponse = await fetch(`${baseServerUrl}/Backend/UnderGraduate/StudentCourseGrades/GetExamTypByCourseId?CourseId=${courseId}&TeamId=${controlTeamId}`, {
                    method: "GET",
                    credentials: "include"
                });
                const examTypesData = await examTypesResponse.json();

                for (const examType of examTypesData) {
                    const examTypeId = examType.Id;
                    const examTypeName = examType.Name;

                    // Construct course object
                    courses.push({
                        courseName: courseName,
                        controlTeamName: controlTeamName,
                        examTypeName: examTypeName,
                        previewUrl: `${baseServerUrl}/Backend/UnderGraduate/StudentCourseGrades?ControlTeamId=${controlTeamId}&CourseId=${courseId}&ExamTypeId=${examTypeId}`,
                        reviewUrl: `${baseServerUrl}/Backend/UnderGraduate/ReviewStudentCourseGrades?ControlTeamId=${controlTeamId}&CourseId=${courseId}&ExamTypeId=${examTypeId}`,
                        downloadUrl: `${baseServerUrl}/Backend/UnderGraduate/StudentCourseGrades/ExportToExcel?TeamId=${controlTeamId}&CourseId=${courseId}&ExamTypeId=${examTypeId}`,
                        uploadUrl: `${baseServerUrl}/Backend/UnderGraduate/StudentCourseGrades/Upload?TeamId=${controlTeamId}&CourseId=${courseId}&ExamTypeId=${examTypeId}`,
                        controlTeamId: controlTeamId,
                        courseId: courseId,
                        examTypeId: examTypeId,
                        courseCode: courseCode
                    });
                }
            }
        }

        return courses;
    } catch (error) {
        console.error("Error fetching courses from portal:", error);
        throw new Error("Failed to fetch courses. Please try again.");
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "openPopupTab") {
        chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
    }
});

