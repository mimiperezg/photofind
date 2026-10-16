function Shotlists() {
  const me = {};

  me.showError = ({ msg, res, type = "danger" } = {}) => {
    const main = document.querySelector("main");
    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.innerText = `${msg}: ${res.status} ${res.statusText}`;
    main.prepend(alert);
  };

  const renderShotlists = (shotlists) => {
    const shotlistsContainer = document.getElementById("shotlists-container");
    shotlistsContainer.innerHTML = "";
    // for each shot list, create a card and append it to the container
    // use name, location, date, status, and how many shots captured to display in the card
    shotlists.forEach((shotlist) => {
      const shotlistElement = document.createElement("div");
      shotlistElement.classList.add("shotlist");
      shotlistElement.innerText = shotlist.name;
      shotlistsContainer.appendChild(shotlistElement);
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
    renderShotlists(shotlists);
  };

  return me;
}

const myShotlists = Shotlists();
myShotlists.refreshShotlists();
