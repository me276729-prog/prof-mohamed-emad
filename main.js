class Student {
    #grade1;
    #grade2;
    #grade3;
    #attendance;

    constructor(name, grade1, grade2, grade3, attendance, id = Date.now()) {
        this.id = id;
        this.name = name;
        this.grade1 = grade1;
        this.grade2 = grade2;
        this.grade3 = grade3;
        this.attendance = attendance;
    }

    set grade1(value) {
        if (value === "" || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 100) {
            throw new Error("درجة المادة الأولى يجب أن تكون من 0 إلى 100");
        }
        this.#grade1 = Number(value);
    }

    set grade2(value) {
        if (value === "" || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 100) {
            throw new Error("درجة المادة الثانية يجب أن تكون من 0 إلى 100");
        }
        this.#grade2 = Number(value);
    }

    set grade3(value) {
        if (value === "" || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 100) {
            throw new Error("درجة المادة الثالثة يجب أن تكون من 0 إلى 100");
        }
        this.#grade3 = Number(value);
    }

    set attendance(value) {
        if (value === "" || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 100) {
            throw new Error("نسبة الحضور يجب أن تكون من 0 إلى 100");
        }
        this.#attendance = Number(value);
    }

    get grade1() {
        return this.#grade1;
    }

    get grade2() {
        return this.#grade2;
    }

    get grade3() {
        return this.#grade3;
    }

    get attendance() {
        return this.#attendance;
    }

    get average() {
        return (this.#grade1 + this.#grade2 + this.#grade3) / 3;
    }

    get status() {
        if (this.average >= 50) return "ناجح";
        if (this.average >= 40) return "متعثر";
        return "راسب";
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            grade1: this.grade1,
            grade2: this.grade2,
            grade3: this.grade3,
            attendance: this.attendance
        };
    }
}


document.addEventListener("DOMContentLoaded", function () {

    const studentName = document.getElementById("studentName");
    const grade1 = document.getElementById("grade1");
    const grade2 = document.getElementById("grade2");
    const grade3 = document.getElementById("grade3");
    const attendance = document.getElementById("attendance");

    const addStudent = document.getElementById("addStudent");
    const mercyCommittee = document.getElementById("mercyCommittee");

    const errorMessage = document.getElementById("errorMessage");
    const studentsDisplay = document.getElementById("studentsDisplay");
    const report = document.getElementById("report");

    const totalStudents = document.getElementById("totalStudents");
    const strugglingStudents = document.getElementById("strugglingStudents");
    const successfulStudents = document.getElementById("successfulStudents");
    const generalAverage = document.getElementById("generalAverage");

    const searchInput = document.getElementById("searchInput");
    const darkModeBtn = document.getElementById("darkModeBtn");

    let studentsList = [];

    function showError(message) {
        errorMessage.textContent = message;
    }

    function saveStudents() {
        localStorage.setItem("studentsData", JSON.stringify(studentsList));
    }

    function loadStudents() {
        const savedData = localStorage.getItem("studentsData");

        if (!savedData) return;

        try {
            const data = JSON.parse(savedData);

            if (!Array.isArray(data)) {
                throw new Error("بيانات الطلاب غير صحيحة");
            }

            studentsList = data.map(student => {
                return new Student(
                    student.name,
                    student.grade1,
                    student.grade2,
                    student.grade3,
                    student.attendance,
                    student.id
                );
            });

        } catch (error) {
            studentsList = [];
            localStorage.removeItem("studentsData");
            showError("تعذر تحميل البيانات المحفوظة.");
        }
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function displayStudents(list = studentsList) {
        studentsDisplay.innerHTML = "";

        list.forEach((student, index) => {

            let statusClass = "";

            if (student.status === "ناجح") {
                statusClass = "status-success";
            } else if (student.status === "متعثر") {
                statusClass = "status-warning";
            } else {
                statusClass = "status-fail";
            }

            studentsDisplay.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHTML(student.name)}</td>
                    <td>${student.grade1}</td>
                    <td>${student.grade2}</td>
                    <td>${student.grade3}</td>
                    <td>${student.average.toFixed(2)}</td>
                    <td>${student.attendance}%</td>
                    <td>
                        <span class="${statusClass}">
                            ${student.status}
                        </span>
                    </td>
                    <td>
                        <button class="edit-btn" data-action="edit" data-id="${student.id}">
                            <i class="bi bi-pencil"></i>
                            تعديل
                        </button>

                        <button class="delete-btn" data-action="delete" data-id="${student.id}">
                            <i class="bi bi-trash"></i>
                            حذف
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    function updateStatistics() {
        const struggling = studentsList.filter(student =>
            student.average >= 40 && student.average < 50
        );

        const successful = studentsList.filter(student =>
            student.average >= 50
        );

        const total = studentsList.reduce(
            (sum, student) => sum + student.average, 0
        );

        totalStudents.innerText = studentsList.length;
        strugglingStudents.innerText = struggling.length;
        successfulStudents.innerText = successful.length;

        generalAverage.innerText = studentsList.length > 0
            ? (total / studentsList.length).toFixed(2)
            : "0";
    }

    function refreshSystem() {
        const value = searchInput.value.trim().toLowerCase();

        const filteredStudents = studentsList.filter(student =>
            student.name.toLowerCase().includes(value)
        );

        displayStudents(filteredStudents);
        updateStatistics();
    }

    addStudent.onclick = function () {
        try {
            showError("");

            if (studentName.value.trim() === "") {
                throw new Error("من فضلك أدخل اسم الطالب");
            }

            const student = new Student(
                studentName.value.trim(),
                grade1.value,
                grade2.value,
                grade3.value,
                attendance.value
            );

            studentsList.push(student);

            saveStudents();
            refreshSystem();

            studentName.value = "";
            grade1.value = "";
            grade2.value = "";
            grade3.value = "";
            attendance.value = "";

            report.textContent = "تمت إضافة الطالب بنجاح.";

        } catch (error) {
            showError(error.message);
        }
    };

    searchInput.oninput = function () {
        refreshSystem();
    };

    studentsDisplay.onclick = function (event) {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const id = Number(button.dataset.id);

        const student = studentsList.find(student => student.id === id);

        if (!student) return;

        if (button.dataset.action === "delete") {
            if (confirm("هل أنت متأكد من حذف الطالب؟")) {

                studentsList = studentsList.filter(
                    student => student.id !== id
                );

                saveStudents();
                refreshSystem();

                report.textContent = "تم حذف الطالب بنجاح.";
            }
        }

        if (button.dataset.action === "edit") {
            try {
                const newName = prompt("اسم الطالب:", student.name);

                if (newName === null) return;

                if (newName.trim() === "") {
                    throw new Error("اسم الطالب لا يمكن أن يكون فارغًا");
                }

                const newGrade1 = prompt("درجة المادة الأولى:", student.grade1);
                if (newGrade1 === null) return;

                const newGrade2 = prompt("درجة المادة الثانية:", student.grade2);
                if (newGrade2 === null) return;

                const newGrade3 = prompt("درجة المادة الثالثة:", student.grade3);
                if (newGrade3 === null) return;

                const newAttendance = prompt("نسبة الحضور:", student.attendance);
                if (newAttendance === null) return;

                const updatedStudent = new Student(
                    newName.trim(),
                    newGrade1,
                    newGrade2,
                    newGrade3,
                    newAttendance,
                    student.id
                );

                const index = studentsList.findIndex(
                    student => student.id === id
                );

                studentsList[index] = updatedStudent;

                saveStudents();
                refreshSystem();

                report.textContent = "تم تعديل بيانات الطالب بنجاح.";

            } catch (error) {
                showError(error.message);
            }
        }
    };

    mercyCommittee.onclick = function () {
        const struggling = studentsList.filter(student =>
            student.average >= 40 && student.average < 50
        );

        const newAverages = struggling.map(student => ({
            name: student.name,
            average: student.average + 5
        }));

        const total = newAverages.reduce(
            (sum, student) => sum + student.average, 0
        );

        const finalAverage = newAverages.length > 0
            ? total / newAverages.length
            : 0;

        if (newAverages.length === 0) {
            report.innerHTML = `
                <div class="alert alert-info">
                    لا يوجد طلاب متعثرون بين 40 و49.
                </div>
                <p>عدد الطلاب المتعثرين: 0</p>
                <p>المتوسط العام بعد الرأفة: 0</p>
            `;
            return;
        }

        report.innerHTML = `
            <h6>عدد الطلاب المتعثرين: ${newAverages.length}</h6>

            <h6 class="mt-3">أسماء الطلاب:</h6>

            ${newAverages.map(student => `
                <div class="report-item">
                    <strong>${escapeHTML(student.name)}</strong>
                    <br>
                    المتوسط بعد الرأفة:
                    ${student.average.toFixed(2)}
                </div>
            `).join("")}

            <hr>

            <h5>
                المتوسط العام بعد الرأفة:
                ${finalAverage.toFixed(2)}
            </h5>
        `;
    };

    function applyTheme(isDark) {
        document.body.classList.toggle("dark-mode", isDark);

        darkModeBtn.innerHTML = isDark
            ? '<i class="bi bi-sun"></i> الوضع الفاتح'
            : '<i class="bi bi-moon-stars"></i> الوضع الليلي';

        localStorage.setItem("darkMode", isDark ? "true" : "false");
    }

    darkModeBtn.onclick = function () {
        const isDark = !document.body.classList.contains("dark-mode");
        applyTheme(isDark);
    };

    loadStudents();

    applyTheme(localStorage.getItem("darkMode") === "true");

    refreshSystem();

});