// content.js

(function () {
    // Find the target <ul> element with class "nav navbar-nav"
    const navBar = document.querySelector(".nav.navbar-nav");
    //find second navbar body > div.wrapper > div.main-content > div.page-header.navbar > div > div.hor-menu.hor-menu-light.hor-menu-media-screen > ul
    const navBar2 = document.querySelector("div.hor-menu.hor-menu-light.hor-menu-media-screen > ul");

    if (!navBar && !navBar2) {
        console.error("Navigation bar not found!");
        return;
    }

    // Check if the button already exists to avoid duplicates
    if (document.getElementById("open-extension-li")) return;

    // Create a new <li> element
    const newListItem = document.createElement("li");
    newListItem.className = "classic-menu-dropdown";
    newListItem.id = "open-extension-li";
    newListItem.setAttribute("aria-haspopup", "true");

    // Create the <a> tag inside the <li> for the button
    const newLink = document.createElement("a");
    newLink.href = "#";
    newLink.className = "dropdown-toggle";
    newLink.textContent = "عرض المهام";

    // Add a click event to the <a> tag to open popup.html in a new tab
    newLink.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent the default link behavior
        chrome.runtime.sendMessage({ type: "openPopupTab" });
    });

    // Append the <a> to the <li>
    newListItem.appendChild(newLink);

    // Append the new <li> to the <ul>
    if (navBar) navBar.appendChild(newListItem);
    if (navBar2) navBar2.appendChild(newListItem);

    //get url params if found
    const urlParams = new URLSearchParams(window.location.search);
    const ControlTeamId = urlParams.get('ControlTeamId');
    const CourseId = urlParams.get('CourseId');
    const ExamTypeId = urlParams.get('ExamTypeId');

    //invoke debugger to stop the script
    debugger;
    if (ControlTeamId && CourseId && ExamTypeId) {
        //remove the input fields that are related to kendo dropdownlist
        document.querySelector('#SelectedPermission_ControlTeamId').remove();
        document.querySelector('#SelectedPermission_CourseId').remove();
        document.querySelector('#SelectedPermission_ExamTypeId').remove();
        
        //add new inputs with default values passed from the url
        const inputControlTeamId = document.createElement('input');
        inputControlTeamId.setAttribute('id', 'SelectedPermission_ControlTeamId');
        inputControlTeamId.setAttribute('name', 'SelectedPermission.ControlTeamId');
        inputControlTeamId.setAttribute('value', ControlTeamId);
        document.querySelector('#Main').appendChild(inputControlTeamId);

        const inputCourseId = document.createElement('input');
        inputCourseId.setAttribute('id', 'SelectedPermission_CourseId');
        inputCourseId.setAttribute('name', 'SelectedPermission.CourseId');
        inputCourseId.setAttribute('value', CourseId);
        document.querySelector('#Main').appendChild(inputCourseId);

        const inputExamTypeId = document.createElement('input');
        inputExamTypeId.setAttribute('id', 'SelectedPermission_ExamTypeId');
        inputExamTypeId.setAttribute('name', 'SelectedPermission.ExamTypeId');
        inputExamTypeId.setAttribute('value', ExamTypeId);
        document.querySelector('#Main').appendChild(inputExamTypeId);
        
        //post the form
        document.querySelector('#Main').submit();
    }

})();

