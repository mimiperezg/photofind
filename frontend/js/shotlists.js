function Shotlists() {
  const me = {};
  let allShotlists = [];

  me.showError = ({ msg, res, type = "danger" } = {}) => {
    const main = document.querySelector("main");
    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.innerText = `${msg}: ${res.status} ${res.statusText}`;
    main.prepend(alert);
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
      `,
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
            <button class="btn btn-sm btn-outline-primary">Edit</button>
            <button class="btn btn-sm btn-outline-danger">Delete</button>
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
        renderShotlists(allShotlists.slice(0, 20));
      });
    });
  };

  const renderShotlists = (shotlists) => {
    const shotlistsContainer = document.getElementById("shotlists-container");
    shotlistsContainer.innerHTML = "";
    // for each shot list, create a card and append it to the container
    // use name, location, date, status, and how many shots captured to display in the card
    shotlists.forEach((shotlist) => {
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
  };

  me.refreshShotlists = async () => {
    const res = await fetch("/api/shotlists");
    if (!res.ok) {
      me.showError({ msg: "Failed to fetch shotlists", res });
      return;
    }

    const shotlists = await res.json();
    allShotlists = shotlists;
    console.log("Fetched shotlists:", shotlists);
    renderShotlists(shotlists.slice(0, 20));
  };

  return me;
}

const myShotlists = Shotlists();
myShotlists.refreshShotlists();
