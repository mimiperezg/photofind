function Shotlists() {
  const me = {};

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
        ${shotlist.location} · ${formatDateRange(shotlist.startDate, shotlist.endDate)}
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
    console.log("Fetched shotlists:", shotlists);
    renderShotlists(shotlists.slice(0, 20));
  };

  return me;
}

const myShotlists = Shotlists();
myShotlists.refreshShotlists();
