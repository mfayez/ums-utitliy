document.addEventListener("DOMContentLoaded", () => {
    const coursesTable = document.getElementById("coursesTable").querySelector("tbody");

    // Fetch and display courses
    fetchAndDisplayCourses();

    // Add event listeners for filtering
    document.querySelectorAll("select").forEach(select => {
        select.addEventListener("change", () => {
            filterTable();
        });
    });
});

// Fetch courses and populate the table
async function fetchAndDisplayCourses() {
    const coursesTable = document.getElementById("coursesTable").querySelector("tbody");

    try {
        const courses = await fetchCourses();
        coursesTable.innerHTML = ""; // Clear loading state

        const courseNames = new Set();
        const controlTeams = new Set();
        const examTypes = new Set();

        courses.forEach(course => {
            // Collect unique values for dropdowns
            courseNames.add(course.courseName);
            controlTeams.add(course.controlTeamName);
            examTypes.add(course.examTypeName);

            // Add table row
            const row = document.createElement("tr");

            // Course Name
            const courseNameCell = document.createElement("td");
            courseNameCell.textContent = course.courseName;
            row.appendChild(courseNameCell);

            // Control Team
            const controlTeamCell = document.createElement("td");
            controlTeamCell.textContent = course.controlTeamName;
            row.appendChild(controlTeamCell);

            // Exam Type
            const examTypeCell = document.createElement("td");
            examTypeCell.textContent = course.examTypeName;
            row.appendChild(examTypeCell);

            // Review Button
            const previewCell = document.createElement("td");
            const previewButton = document.createElement("button");
            previewButton.textContent = "Review";
            previewButton.addEventListener("click", () => handlePreview(course));
            previewCell.appendChild(previewButton);
            row.appendChild(previewCell);

            // Download Button
            const downloadCell = document.createElement("td");
            const downloadButton = document.createElement("button");
            downloadButton.textContent = "Download";
            downloadButton.addEventListener("click", () => handleDownload(course));
            downloadCell.appendChild(downloadButton);
            row.appendChild(downloadCell);

            // Upload Form
            const uploadCell = document.createElement("td");
            const fileInput = document.createElement("input");
            fileInput.type = "file";

            const uploadButton = document.createElement("button");
            uploadButton.textContent = "Upload";
            uploadButton.addEventListener("click", () => handleUpload(course, fileInput.files[0]));

            uploadCell.appendChild(fileInput);
            uploadCell.appendChild(uploadButton);
            row.appendChild(uploadCell);

            coursesTable.appendChild(row);
        });

        // Populate dropdowns
        populateDropdown("courseNameFilter", courseNames);
        populateDropdown("controlTeamFilter", controlTeams);
        populateDropdown("examTypeFilter", examTypes);

    } catch (error) {
        console.error("Error loading courses:", error);
        coursesTable.innerHTML = `<tr><td colspan="6">Failed to load courses.</td></tr>`;
    }
}

// Populate dropdown with unique values
function populateDropdown(dropdownId, values) {
    const dropdown = document.getElementById(dropdownId);
    values.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        dropdown.appendChild(option);
    });
}

// Filter table rows based on dropdown selections
function filterTable() {
    const courseNameFilter = document.getElementById("courseNameFilter").value.toLowerCase();
    const controlTeamFilter = document.getElementById("controlTeamFilter").value.toLowerCase();
    const examTypeFilter = document.getElementById("examTypeFilter").value.toLowerCase();

    const table = document.getElementById("coursesTable");
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach(row => {
        const courseName = row.children[0]?.textContent.toLowerCase();
        const controlTeam = row.children[1]?.textContent.toLowerCase();
        const examType = row.children[2]?.textContent.toLowerCase();

        if (
            (courseNameFilter === "" || courseName.includes(courseNameFilter)) &&
            (controlTeamFilter === "" || controlTeam.includes(controlTeamFilter)) &&
            (examTypeFilter === "" || examType.includes(examTypeFilter))
        ) {
            row.style.display = ""; // Show the row
        } else {
            row.style.display = "none"; // Hide the row
        }
    });
}

async function handlePreview(course) {
    chrome.tabs.create({ url: course.previewUrl });
}

async function handleDownload(course) {
    try {
        const response = await fetch(`${course.downloadUrl}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                "AuthenticatedAction": "NoStarted",
                "SelectedPermission.ControlTeamId": course.controlTeamId,
                "SelectedPermission.CourseId": course.courseId,
                "SelectedPermission.ExamTypeId": course.examTypeId,
                "SelectedPermission.ExamRoundId": "1007", // Example value, replace as needed
                "SelectedPermission.ProgramId": "",
                "SelectedPermission.TermId": "0",
                "SelectedPermission.RegulationId": "",
                "SelectedPermission.AcademicYearId": "0",
                "CourseNameSheet": course.courseName,
                "CoureCodeSheet": course.courseCode,
                "orderById": "S"
            }),
            credentials: "include"
        });

        if (response.ok && response.headers.get("Content-Type").includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${course.courseName}_${course.examTypeName}.xlsx`;
            link.click();
            URL.revokeObjectURL(url);
        } else {
            console.error("Failed to download file:", response.status, response.statusText);
            alert("Failed to download file. Please try again.");
        }
    } catch (error) {
        console.error("Error downloading file:", error);
        alert("An error occurred while downloading the file. Please try again.");
    }
}


// Handle uploading the file
function handleUpload(course, file) {
    alert("Upload is not ready yet!");
    return;
    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    alert(`Uploading file "${file.name}" for course "${course.courseName}"...`);
}

// Fetch the courses (same logic as existing)
async function fetchCourses() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: "fetchCourses" }, (response) => {
            if (response && response.success) {
                resolve(response.courses);
            } else {
                reject(response.error || "Unknown error");
            }
        });
    });
}

