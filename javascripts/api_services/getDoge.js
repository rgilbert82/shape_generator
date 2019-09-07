// ============================================================================
// GET image
// ============================================================================

function getDoge() {
  return new Promise((resolve, reject) => {
    const cors    = 'https://cors-proxy.htmldriven.com/?url=';  // CORS proxy
    const path    = 'http://shibe.online/api/shibes?count=1&urls=true&httpsUrls=true';
    const url     = cors + path;
    const request = new XMLHttpRequest();

    request.onreadystatechange = () => {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          resolve(JSON.parse(JSON.parse(request.responseText).body)[0]);
        } else {
          reject("Error");
        }
      }
    }

    request.open('GET', url);
    request.send();
  });
}
