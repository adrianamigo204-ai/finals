const accounts = {
    user: { username: "user", password: "user123", page: "user.html" },
    admin: { username: "admin", password: "admin123", page: "admin.html" },
    "super-admin": { username: "superadmin", password: "super123", page: "superadmin.html" }
};

const services = [
    { name: "CVT Cleaning", description: "Routine cleaning for smoother transmission response and better daily performance." },
    { name: "CVT Check Up", description: "Full CVT inspection to catch wear early and keep the ride reliable." },
    { name: "CVT Upgrade", description: "Performance upgrades for stronger acceleration and cleaner power delivery." },
    { name: "REWIRING", description: "Complete rewiring service for damaged, old, or unsafe electrical setups." },
    { name: "Wiring Check Up", description: "Electrical system inspection for lights, switches, battery, and charging." },
    { name: "Installation of Horn/Auxilliary Lights", description: "Clean fitment for louder horns and brighter auxiliary lighting." },
    { name: "Installation of Pipe/Swing Arm/Topbox", description: "Careful installation for exhausts, swing arms, and top boxes." },
    { name: "Refresh Engine", description: "Engine refresh service to restore smoothness, response, and dependability." },
    { name: "Engine Upgrade", description: "Upgrade internal parts and tuning for a stronger engine setup." },
    { name: "Repacking of Front Shock", description: "Front shock service to improve comfort, control, and oil sealing." },
    { name: "Change Oil/Engine Oil/Gear Oil", description: "Fresh fluids for cleaner running, smoother shifting, and engine protection." },
    { name: "Race Bike", description: "Track-focused preparation for riders building a faster, sharper race machine." }
];

const defaultAppointments = [
    { fullname: "Marco Reyes", motorcycle: "Aerox 155", service: "CVT Cleaning", date: "2026-04-24", time: "09:00", notes: "Slight vibration at takeoff", status: "Pending" },
    { fullname: "Luis Navarro", motorcycle: "NMAX", service: "Change Oil/Engine Oil/Gear Oil", date: "2026-04-25", time: "11:30", notes: "Regular maintenance", status: "Confirmed" }
];

function getAppointments() {
    const stored = localStorage.getItem("garageAppointments");

    if (!stored) {
        localStorage.setItem("garageAppointments", JSON.stringify(defaultAppointments));
        return defaultAppointments.slice();
    }

    return JSON.parse(stored);
}

function saveAppointments(appointments) {
    localStorage.setItem("garageAppointments", JSON.stringify(appointments));
}

function getUserProfile() {
    const stored = localStorage.getItem("garageUserProfile");

    if (!stored) {
        return {
            fullname: "",
            email: "",
            phone: "",
            motorcycle: "",
            notes: "",
            notifications: true
        };
    }

    return JSON.parse(stored);
}

function saveUserProfile(profile) {
    localStorage.setItem("garageUserProfile", JSON.stringify(profile));
}

function logOut() {
    localStorage.removeItem("garageRole");
    window.location.href = "login.html";
}

function protectPage() {
    const pageRole = document.body.dataset.role;

    if (!pageRole) {
        return;
    }

    const savedRole = localStorage.getItem("garageRole");

    if (savedRole !== pageRole) {
        window.location.href = "login.html";
    }
}

function setupLogin() {
    const form = document.getElementById("login-form");

    if (!form) {
        return;
    }

    const message = document.getElementById("form-message");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const role = document.getElementById("role").value;
        const username = document.getElementById("username").value.trim().toLowerCase();
        const password = document.getElementById("password").value.trim();
        const account = accounts[role];

        if (!account) {
            message.textContent = "Please select a role.";
            return;
        }

        if (username === account.username && password === account.password) {
            localStorage.setItem("garageRole", role);
            window.location.href = account.page;
            return;
        }

        message.textContent = "Wrong login details.";
    });
}

function setupPanels() {
    const buttons = document.querySelectorAll("[data-panel-target]");
    const panels = document.querySelectorAll(".dashboard-panel");

    if (!buttons.length || !panels.length) {
        return;
    }

    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            const targetId = button.dataset.panelTarget;

            buttons.forEach(function (item) {
                item.classList.remove("active");
            });

            panels.forEach(function (panel) {
                panel.classList.remove("active");
            });

            button.classList.add("active");
            document.getElementById(targetId).classList.add("active");
        });
    });
}

function renderServices(containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
        return;
    }

    container.innerHTML = "";

    services.forEach(function (service) {
        const item = document.createElement("article");
        item.className = "list-row";
        item.innerHTML = "<h3>" + service.name + "</h3><p>" + service.description + "</p>";
        container.appendChild(item);
    });
}

function renderOrders() {
    const list = document.getElementById("admin-orders-list");

    if (!list) {
        return;
    }

    const appointments = getAppointments();
    list.innerHTML = "";

    appointments.forEach(function (appointment) {
        const item = document.createElement("article");
        item.className = "list-row";
        item.innerHTML =
            "<h3>" + appointment.fullname + " - " + appointment.service + "</h3>" +
            "<p>" + appointment.motorcycle + " | " + appointment.date + " | " + appointment.time + " | " + appointment.status + "</p>" +
            "<p>" + appointment.notes + "</p>";
        list.appendChild(item);
    });
}

function updateAdminStats() {
    const appointments = getAppointments();
    const orderCount = appointments.length;
    const pendingCount = appointments.filter(function (item) {
        return item.status === "Pending";
    }).length;

    const inventoryCount = document.getElementById("admin-inventory-count");
    const serviceCount = document.getElementById("admin-service-count");
    const orders = document.getElementById("admin-order-count");
    const pending = document.getElementById("admin-pending-count");
    const topService = document.getElementById("admin-top-service");
    const upcoming = document.getElementById("admin-upcoming-bookings");

    if (inventoryCount) inventoryCount.textContent = "85";
    if (serviceCount) serviceCount.textContent = String(services.length);
    if (orders) orders.textContent = String(orderCount);
    if (pending) pending.textContent = String(pendingCount);
    if (upcoming) upcoming.textContent = orderCount + " appointments scheduled";

    if (topService) {
        if (!appointments.length) {
            topService.textContent = "No bookings yet";
        } else {
            const counts = {};
            appointments.forEach(function (item) {
                counts[item.service] = (counts[item.service] || 0) + 1;
            });

            let topName = "";
            let topValue = 0;

            Object.keys(counts).forEach(function (name) {
                if (counts[name] > topValue) {
                    topName = name;
                    topValue = counts[name];
                }
            });

            topService.textContent = topName + " (" + topValue + ")";
        }
    }
}

function updateSuperAdminStats() {
    const appointments = getAppointments();
    const userCount = document.getElementById("superadmin-user-count");
    const inventoryCount = document.getElementById("superadmin-inventory-count");
    const serviceCount = document.getElementById("superadmin-service-count");
    const appointmentCount = document.getElementById("superadmin-appointment-count");

    if (userCount) userCount.textContent = "3";
    if (inventoryCount) inventoryCount.textContent = "85";
    if (serviceCount) serviceCount.textContent = String(services.length);
    if (appointmentCount) appointmentCount.textContent = String(appointments.length);
}

function setupServiceSelector() {
    const select = document.getElementById("service-select");
    const title = document.getElementById("service-title");
    const description = document.getElementById("service-description");

    if (!select || !title || !description) {
        return;
    }

    function renderSelectedService() {
        const current = services.find(function (service) {
            return service.name === select.value;
        });

        if (!current) {
            return;
        }

        title.textContent = current.name;
        description.textContent = current.description;
    }

    select.addEventListener("change", renderSelectedService);
    renderSelectedService();
}

function setupScheduleForm() {
    const form = document.getElementById("schedule-form");

    if (!form) {
        return;
    }

    const message = document.getElementById("schedule-message");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const appointments = getAppointments();

        appointments.push({
            fullname: formData.get("fullname"),
            motorcycle: formData.get("motorcycle"),
            service: formData.get("service"),
            date: formData.get("date"),
            time: formData.get("time"),
            notes: formData.get("notes") || "No notes",
            status: "Pending"
        });

        saveAppointments(appointments);
        message.textContent = "Appointment submitted successfully.";
        form.reset();
    });
}

function setupProfileSettings() {
    const form = document.getElementById("profile-settings-form");

    if (!form) {
        return;
    }

    const message = document.getElementById("profile-settings-message");
    const profile = getUserProfile();

    form.elements.fullname.value = profile.fullname || "";
    form.elements.email.value = profile.email || "";
    form.elements.phone.value = profile.phone || "";
    form.elements.motorcycle.value = profile.motorcycle || "";
    form.elements.notes.value = profile.notes || "";
    form.elements.notifications.checked = Boolean(profile.notifications);

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        saveUserProfile({
            fullname: form.elements.fullname.value.trim(),
            email: form.elements.email.value.trim(),
            phone: form.elements.phone.value.trim(),
            motorcycle: form.elements.motorcycle.value.trim(),
            notes: form.elements.notes.value.trim(),
            notifications: form.elements.notifications.checked
        });

        message.textContent = "Profile settings saved.";
    });
}

document.addEventListener("DOMContentLoaded", function () {
    protectPage();
    setupLogin();
    setupPanels();
    renderServices("admin-services-list");
    renderServices("superadmin-services-list");
    renderOrders();
    updateAdminStats();
    updateSuperAdminStats();
    setupServiceSelector();
    setupScheduleForm();
    setupProfileSettings();
});
