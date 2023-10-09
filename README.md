
# Quantization Wizard 🪄

A client-side web application for the quantization of colors in images.

It's a tool that processes images and limits the number of colors present in them.

Created as a university project for the multimedia subject.
The project requirements document is available in [docs/university-project-requirements.pdf](./docs/university-project-requirements.pdf)

### Why a client-side web application?

- Can be launched by simply clicking a link.
- Doesn't require installation at the users devices.
- Easier to trust with the browser sandbox limiting the application.
- Could be added to the applications list of the system by a single click (PWA).
- Platform-independent. Can run on Windows, Linux, macOS and possibly Android and iOS.
- Doesn't sacrifice the privacy of the users because it runs completely client-side.
    - _Web applications doesn't necessarily have to upload the users data into some unknown cloud services._
- Works offline after being loaded once.
- Receives updates seamlessly.

## Screenshots

FIXME: Add screenshots of the project.

## Features

- Runs completely on the browser.
- Client-side logic only. A web server is used only for serving the application code. No user-data is sent to any server.
- Installable as a PWA (Progressive Web Application) that works offline after being loaded once.
- Supports 4 quantization algorithms: naïve k-means, median cut, octree, popularity.
    - Up to 256 colors.
    - Runs in a separate thread from the UI by utilizing [web workers](https://en.wikipedia.org/wiki/Web_worker).
- View the result color palette and a histogram of them.
- Batch mode for processing many images at once.
- Non-standard indexed image binary format.
    - Stores palette and histogram information.
    - Allows for fast similar image search based on those information.
    - Can be loaded back and exported as a PNG image.


## Technology Stack

- A single page application (SPA).
- Written completely in strict TypeScript.
- Bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
- Using [MUI Core](https://mui.com/core/) for the fancy UI components.
- Using Web Workers for intensive computation tasks in order to prevent blocking the main UI thread.

## Installation instructions

1. Clone the git repository locally or download the source-code and extract it.
2. Install [Node.js](https://nodejs.org/) 16.x or later on your system.
3. Enable Yarn through `corepack`, which ships with Node 16.x.

```sh
# Use an elevated shell (Administrator shell on Windows, sudo on Unix).
corepack enable
```

4. Open a terminal in the root of the repository and install the project's dependencies.

```sh
yarn
```

5. Start the development server.

```sh
yarn start
```

6. A browser page (http://localhost:3000/quantization-wizard) should automatically open with the project running in it.

## Build Instructions

After following the installation instructions run:

```sh
yarn build
```

The build can be then accessed at `/build` and could be [served as static page content](https://create-react-app.dev/docs/deployment/).

## Learn More

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-starte).
- [React documentation](https://react.dev/).
- [TypeScript documentation](https://www.typescriptlang.org/).
- [React TypeScript cheatsheet](https://react-typescript-cheatsheet.netlify.app/): useful for figuring out how to specify types while working with react.
- [React Material UI documentation](https://mui.com/core/).
- [MDN Web Workers Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers).
- [Webpack Web Workers Guide](https://webpack.js.org/guides/web-workers/) (Create React App uses Webpack).
- [k-means Clustering Algorithm](https://en.wikipedia.org/wiki/K-means_clustering).

## Developed By

- [Rami Sabbagh](https://rami-sabbagh.github.io/) ([rami.sab07@gmail.com](mailto:rami.sab07@gmail.com)): Graphical User Interface, Code structure, Performance optimization, Naïve k-means quantization algorithm implementation.
- Hrayr Derbedrossian: Median-cut and Popularity algorithms implementation.
- Haider Al-sous: Octree quantization algorithm implementation.
- Marianne Deeb: Median-cut and Popularity algorithms implementation.
