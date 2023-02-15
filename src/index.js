const route = (event) => {
  event = event || window.event;
  event.preventDefault();
  window.history.pushState({}, "", event.target.href);
  // 重新加载页面
  window.location.reload();
  handleLocation();
};

const routes = {
  404: "/src/pages/404.html",
  "/": "/src/pages/index.html",
  "/fox": "/src/pages/foxPage/index.html",
  "/cloud": "/src/pages/cloudPage/index.html",
  "/lineDoge": "/src/pages/lineDogePage/index.html",
  "/cloudShader": "/src/pages/cloudShader/index.html",
};

const handleLocation = async () => {
  const path = window.location.pathname;
  const route = routes[path] || routes[404];
  const html = await fetch(route).then((data) => data.text());
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  document.write(doc.documentElement.innerHTML);
};

window.onpopstate = handleLocation;
window.route = route;

handleLocation();
