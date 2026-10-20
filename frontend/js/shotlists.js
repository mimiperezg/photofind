function Shotlists() {
  const me = {};
  let allShotlists = [];
  // default status filter is all
  let currentStatus = "all";

  // remember the page we are on
  let currentPage = 1;
  // shotlists per page
  const pageSize = 3;

  me.showError = ({ msg, res, type = "danger" } = {}) => {
    const main = document.querySelector("main");
    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.innerText = `${msg}: ${res.status} ${res.statusText}`;
    main.prepend(alert);
  };

  // success message for users
  const showSuccess = (msg) => {
    const messageArea = document.getElementById("message-area");

    const alert = document.createElement("div");
    // bootstrap alert classes and styling
    alert.className = "alert alert-success py-1 px-2 mb-0 small";
    alert.setAttribute("role", "status");
    alert.innerText = msg;

    messageArea.innerHTML = "";
    messageArea.appendChild(alert);

    // remove after 3 seconds
    setTimeout(() => alert.remove(), 3000);
  };

  // dictionary of status labels from mock data to give to display
  const statusLabel = (status) =>
    ({
      upcoming: "Upcoming",
      "in-progress": "In progress",
      completed: "Completed",
    })[status] || status;

  // formats the ISO date in the mock data to user friendly format
  // grabbing start and end dates from users,
  // using month as the short version, and day as the numeric version
  const formatDateRange = (start, end) => {
    const options = { month: "short", day: "numeric" };
    // convert the start and end dates to local date strings in the specified format
    const s = new Date(start + "T00:00").toLocaleDateString("en-US", options);
    const e = new Date(end + "T00:00").toLocaleDateString("en-US", options);
    // returns a string in the format of "MMM DD - MMM DD" or "MMM DD" if the start and end dates are the same
    return s === e ? s : `${s} - ${e}`;
  };

  const renderDetails = (shotlist) => {
    const details = document.getElementById("shotlist-details");

    const total = shotlist.shots.length;
    const captured = shotlist.shots.filter((shot) => shot.captured).length;
    const percent = total == 0 ? 0 : Math.round((captured / total) * 100);

    // go through each shot in that list, and create a row for it
    const shotsRows = shotlist.shots
      .map(
        (shot, index) => `
        <li class="list-group-item d-flex gap-3 align-items-start">
          <input
            class="form-check-input mt-0"
            type="checkbox"
            id="shot-${index}"
            ${shot.captured ? "checked" : ""}
          />
          <label for="shot-${index}">
            ${shot.title}
            ${shot.notes ? `<br><small class="text-body-secondary">${shot.notes}</small>` : ""}
          </label>
        </li>
      `
      )
      .join("");

    details.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div>
            <h2 class="h6 mb-1">${shotlist.name}</h2>
            <p class="text-body-secondary mb-0">
              ${shotlist.location}, ${formatDateRange(shotlist.startDate, shotlist.endDate)}
            </p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary" id="edit-btn">Edit</button>
            <button class="btn btn-sm btn-outline-danger" id="delete-btn">Delete</button>
          </div>
        </div>

        <p class="mt-3 mb-1">${statusLabel(shotlist.status)}, ${captured}/${total}</p>
        <div
          class="progress"
          style="height: 6px"
          role="progressbar"
          aria-label="${shotlist.name} progress"
          aria-valuenow="${percent}"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div class="progress-bar bg-success" style="width: ${percent}%"></div>
        </div>

        <ul class="list-group list-group-flush">
          ${shotsRows}
        </ul>
      </div>
    `;

    // find all checkboxes inn the details section and
    // add an event listener to each one to update the captured status of that shot in the database
    details.querySelectorAll(".form-check-input").forEach((checkbox, index) => {
      // waiting for user to tick or untick the checkbox
      checkbox.addEventListener("change", async () => {
        // send a patch request to the backend to update the captured status of the shot in the DB
        // sending a message to express route
        await fetch(`/api/shotlists/${shotlist._id}/shots/${index}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ captured: checkbox.checked }),
        });

        // this updates the copy in the browser
        shotlist.shots[index].captured = checkbox.checked;
        renderDetails(shotlist);
        renderShotlists();
      });
    });

    // delete this shotlist
    document
      .getElementById("delete-btn")
      .addEventListener("click", async () => {
        if (!confirm(`Delete "${shotlist.name}"?`)) {
          return;
        }

        const res = await fetch(`/api/shotlists/${shotlist._id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          me.showError({ msg: "failed to delete shotlist", res });
          return;
        }

        // remove it from the page's copy and redraw
        allShotlists = allShotlists.filter((s) => s._id !== shotlist._id);
        renderShotlists();
        // call success message
        showSuccess(`Deleted "${shotlist.name}"`);

        // redraw the select shotlists message
        details.innerHTML = `
        <div class="card-body text-body-secondary">
          Select shot list to view details
        </div>
      `;
      });

    // edit button
    document.getElementById("edit-btn").addEventListener("click", () => {
      renderEditform(shotlist);
    });
  };

  const renderNewForm = () => {
    const details = document.getElementById("shotlist-details");

    details.innerHTML = `
    <form class="card-body" id="new-shotlist-form">
      <h2 class="h6 mb-3">New shot list</h2>

      <label for="new-name" class="form-label">Name</label>
      <input id="new-name" class="form-control mb-3" required />

      <label for="new-location" class="form-label">Location</label>
      <input id="new-location" class="form-control mb-3" required />

      <label for="new-start" class="form-label">Start date</label>
      <input id="new-start" type="date" class="form-control mb-3" required />

      <label for="new-end" class="form-label">End date</label>
      <input id="new-end" type="date" class="form-control mb-3" required />

      <label for="new-shots" class="form-label">Shots (one per line)</label>
      <textarea id="new-shots" class="form-control mb-3" rows="5"></textarea>

      <button type="submit" class="btn btn-dark">Save</button>
    </form>
  `;

    const form = document.getElementById("new-shotlist-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const shotsText = document.getElementById("new-shots").value;
      const shots = shotsText
        // breaks text at new line
        .split("\n")
        // removes extra spaces
        .map((line) => line.trim())
        // drops empty lines
        .filter((line) => line !== "")
        // turns each title into a shot object
        .map((line) => ({ title: line, notes: null, captured: false }));
      // the new list
      const newShotList = {
        name: document.getElementById("new-name").value,
        location: document.getElementById("new-location").value,
        startDate: document.getElementById("new-start").value,
        endDate: document.getElementById("new-end").value,
        status: "upcoming",
        shots: shots,
      };

      // send it to the server to save
      const res = await fetch("/api/shotlists", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(newShotList),
      });

      if (!res.ok) {
        me.showError({ msg: "failed to create shot list", res });
        return;
      }

      // add saved list to top then redraw
      const saved = await res.json();
      allShotlists.unshift(saved);
      renderShotlists();
      showSuccess(`Created "${saved.name}"`);
      renderDetails(saved);
    });
  };

  const renderEditform = (shotlist) => {
    const details = document.getElementById("shotlist-details");

    details.innerHTML = `
      <form class="card-body" id="edit-shotlist-form">
        <h2 class="h6 mb-3">Edit shot list</h2>

        <label for="edit-name" class="form-label">Name</label>
        <input id="edit-name" class="form-control mb-3" required />

        <label for="edit-location" class="form-label">Location</label>
        <input id="edit-location" class="form-control mb-3" />

        <label for="edit-start" class="form-label">Start date</label>
        <input id="edit-start" type="date" class="form-control mb-3" required />

        <label for="edit-end" class="form-label">End date</label>
        <input id="edit-end" type="date" class="form-control mb-3" required />

        <button type="submit" class="btn btn-dark">Save</button>
        <button type="button" class="btn btn-outline-secondary" id="cancel-edit">Cancel</button>
      </form>
    `;

    // fill in current values
    document.getElementById("edit-name").value = shotlist.name;
    document.getElementById("edit-location").value = shotlist.location;
    document.getElementById("edit-start").value = shotlist.startDate;
    document.getElementById("edit-end").value = shotlist.endDate;

    // cancel goes back to details
    document.getElementById("cancel-edit").addEventListener("click", () => {
      renderDetails(shotlist);
    });

    // save the changes
    document
      .getElementById("edit-shotlist-form")
      .addEventListener("submit", async (event) => {
        event.preventDefault();

        const updates = {
          name: document.getElementById("edit-name").value,
          location: document.getElementById("edit-location").value,
          startDate: document.getElementById("edit-start").value,
          endDate: document.getElementById("edit-end").value,
        };

        const res = await fetch(`api/shotlists/${shotlist._id}`, {
          method: "PUT",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!res.ok) {
          me.showError({ msg: "failed to update shotlist", res });
          return;
        }

        Object.assign(shotlist, updates);
        renderShotlists();
        renderDetails(shotlist);
        showSuccess(`Updates "${shotlist.name}"`);
      });
  };

  const renderShotlists = () => {
    const shotlistsContainer = document.getElementById("shotlists-container");
    shotlistsContainer.innerHTML = "";

    // pick which list to show based on selected status filter. only showing up to 20 at a time.
    const filtered =
      currentStatus === "all"
        ? allShotlists
        : allShotlists.filter((s) => s.status === currentStatus);

    // calculated how many pages based off the number of shotlists and page size
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    // where the page starts, which shotlist it starts on (index)
    const start = (currentPage - 1) * pageSize;

    // which page the user is on
    document.getElementById("page-info").textContent =
      `Page ${currentPage} of ${totalPages}`;
    // disable prev page button if on page 1
    document.getElementById("prev-page").disabled = currentPage === 1;
    // disable next page button if on last page
    document.getElementById("next-page").disabled = currentPage === totalPages;

    // for each shot list, create a card and append it to the container
    // use name, location, date, status, and how many shots captured to display in the card
    filtered.slice(start, start + pageSize).forEach((shotlist) => {
      // total number of shots in the shotlist
      const total = shotlist.shots.length;
      // number of shots that have been captured in the shotlist
      const captured = shotlist.shots.filter((shot) => shot.captured).length;
      // percentage of shots that have been captured in the shotlist rounded to nearest whole number
      const percent = total == 0 ? 0 : Math.round((captured / total) * 100);

      // creating card as button so it is clickable
      const card = document.createElement("button");
      card.className = "card text-start shotlist-card";
      card.dataset.id = shotlist._id;

      card.innerHTML = `
    <div class="card-body">
      <h2 class="h6 mb-1">${shotlist.name}</h2>
      <p class="small text-body-secondary mb-2">
        ${shotlist.location}, ${formatDateRange(shotlist.startDate, shotlist.endDate)}
      </p>
      <p class="small mb-1">${statusLabel(shotlist.status)}, ${captured}/${total}</p>
      <div 
      class="progress" 
      style="height: 6px"
      role="progressbar"
      aria-label="${shotlist.name} progress"
      aria-valuenow="${percent}" 
      aria-valuemin="0" 
      aria-valuemax="100"
      >
        <div class="progress-bar bg-success" style="width: ${percent}%"></div>
      </div>
    </div>
    `;

      // make the card clickable to navigate to the shotlist details page
      card.addEventListener("click", () => {
        document
          .querySelectorAll(".shotlist-card")
          .forEach((c) => c.classList.remove("active"));
        card.classList.add("active");

        // render details of that card in the details section
        renderDetails(shotlist);
      });

      shotlistsContainer.appendChild(card);
    });

    renderStats();
  };
  // statistics across all shots
  const renderStats = () => {
    const statsContainer = document.getElementById("shotlists-stats");

    const totalLists = allShotlists.length;
    let shotsPlanned = 0;
    let shotsCaptured = 0;

    // calculate how many shots captured out of the ones planned
    allShotlists.forEach((shotlist) => {
      shotsPlanned += shotlist.shots.length;
      shotsCaptured += shotlist.shots.filter((shot) => shot.captured).length;
    });

    let completion;
    if (shotsPlanned === 0) {
      completion = 0;
    } else {
      completion = Math.round((shotsCaptured / shotsPlanned) * 100);
    }

    // create stats html
    statsContainer.innerHTML = `
      <div class="col-6 col-md-3">
        <div class="border rounded p-2">
          <small class="text-body-secondary">Lists</small>
          <div class="fs-4 fw-semibold">${totalLists}</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="border rounded p-2">
          <small class="text-body-secondary">Shots planned</small>
          <div class="fs-4 fw-semibold">${shotsPlanned}</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="border rounded p-2">
          <small class="text-body-secondary">Shots captured</small>
          <div class="fs-4 fw-semibold">${shotsCaptured}</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="border rounded p-2">
          <small class="text-body-secondary">Completion</small>
          <div class="fs-4 fw-semibold">${completion}%</div>
        </div>
      </div>
    `;
  };

  me.setupPagination = () => {
    document.getElementById("prev-page").addEventListener("click", () => {
      // go back one page
      currentPage--;
      renderShotlists();
    });

    document.getElementById("next-page").addEventListener("click", () => {
      // go up one page
      currentPage++;
      renderShotlists();
    });
  };

  // new shot list button
  me.setupNewListButton = () => {
    document.getElementById("newListBtn").addEventListener("click", () => {
      renderNewForm();
    });
  };

  // go through each filter button and add an event listener to it to filter the shotlists based on the status
  me.setupFilters = () => {
    const filterButtons = document.querySelectorAll("[data-status]");

    filterButtons.forEach((button) => {
      // user clicks filter button
      button.addEventListener("click", () => {
        currentStatus = button.dataset.status;
        // reset to page one when filter changes
        currentPage = 1;
        filterButtons.forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
        renderShotlists();
      });
    });
  };

  // fetch the shotlists from the backend, saves them in list, and
  // then calls renderShotlists to display them
  me.refreshShotlists = async () => {
    const res = await fetch("/api/shotlists");
    if (!res.ok) {
      me.showError({ msg: "Failed to fetch shotlists", res });
      return;
    }

    const shotlists = await res.json();
    allShotlists = shotlists;
    console.log("Fetched shotlists:", shotlists);
    renderShotlists();
  };

  return me;
}

const myShotlists = Shotlists();
myShotlists.setupFilters();
myShotlists.setupPagination();
myShotlists.setupNewListButton();
myShotlists.refreshShotlists();
