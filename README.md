# PhotoFind

A web app for organizing, finding, and planning photos, built with Node, Express, MongoDB, and vanilla JavaScript.

- **Live site:** [PhotoFind on Render](https://photofind-lhvb.onrender.com)
- **Design documents:**
  - Shot Lists (Milena): [Design document](docs/design-document-shotlists.pdf)
  - Images and Search (Rishabh): [Design document](ADD-LINK-HERE)
- **Video demo and presentation:** [Watch on YouTube](ADD-LINK-HERE)
- **Slides:** [Presentation](https://docs.google.com/presentation/d/1BLYR7r4rk_WIs3N6ubYqKLufcZmeoD5yGF6nn5ba8NQ/edit?usp=sharing)

![Screenshot of the Shot Lists page](images/shotlists-screenshot.jpg)

## Project Objective

The object was to build a full-stack web application with Node + Express + MongoDB + HTML5 frontend that helps people keep track of their photos before and after they take them. PhotoFind has two independent features, each with its own MongoDB collection:

- **Images and Search** (`gallery.html`, `search.html`): add images, tag them, and search by what you remember
- **Shot Lists** (`shotlists.html`): plan the photos you want to take on a trip, and check them off as you go

## Features

### Shot Lists (Milena Perez-Gerus)

- Create a shot list with a name, location, dates, and the shots you want (one per line)
- Check off shots as you take them, with a progress bar on each list
- Filter lists by status: all, upcoming, in progress, or completed
- Browse 1,000+ lists with pagination (Previous / Next)
- Edit a list's name, location, and dates
- Delete a list, with a confirmation popup message
- Statistics across all lists: total lists, shots planned, shots captured, and completion rate
- **How to use:** open Shot Lists in the navigation bar, click **+ New shot list** to create a trip, click any list to see its shots, and tick the checkboxes as you take each photo.

### Images and Search (Rishabh Kumar)

[Rishabh: add your feature list here]

**How to use:** [Rishabh: add instructions here]

## GenAI Usage

### Milena Perez-Gerus

Model: Claude Opus 5.5

- Learning: explanations of Express routes, the MongoDB Node.js driver, `fetch` request options, using map as an array method, and differences between bootstrap classes.
- Data: MongoDB queries used to clean up Mock data dates and statuses
- Writing: help drafting the README

### Rishabh Kumar

[Rishabh: describe your AI usage here]

## Tech Requirements

- HTML5, CSS3, and vanilla JavaScript (ES6 modules)
- [Bootstrap 5.3](https://getbootstrap.com/) via CDN
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) (ES modules)
- [MongoDB](https://www.mongodb.com/) with the native Node.js driver (no Mongoose)
- ESLint and Prettier

## How to Install and Use

1. Clone the repository:

```bash
   git clone https://github.com/mimiperezg/photofind.git
   cd photofind
```

2. Install the dependencies:

```bash
   npm install
```

3. Start MongoDB with Docker:

```bash
   docker run --name mongodb -p 27017:27017 -v mongodata:/data/db -d mongodb/mongodb-community-server:latest
```

4. Import the mock data: in MongoDB Compass, connect to `mongodb://localhost:27017`, create a database named `photofind` with a collection named `shotLists`, and import `data/shotlists.json`.
5. Start the server:

```bash
   npm start
```

6. Open [http://localhost:3000](http://localhost:3000). By default, the app connects to `mongodb://localhost:27017`. To use another database, set the `MONGODB_URI` environment variable.

## Authors

- **Milena Perez-Gerus**: [Homepage](https://mimiperezg.github.io/homepageMilenaPerezGerus/) · [GitHub](https://github.com/mimiperezg)
- **Rishabh Kumar**: [GitHub](https://github.com/k-rishabh)

## Class

Created for [CS 5610 Web Development](https://johnguerra.co/classes/webDevelopment_online_fall_2026/) at Northeastern University, taught by John Alexis Guerra Gómez.

## License

This project is licensed under the [MIT License](LICENSE).
