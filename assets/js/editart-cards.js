/**
 * EditArt project cards on NFT.html — lista em NFT.json → editArtProjects
 */

(function () {
  function extractIpfsCid(uri) {
    if (!uri) return null;
    if (uri.indexOf("ipfs://") === 0) {
      return uri.slice(7).split("?")[0].split("/")[0];
    }
    var match = uri.match(/\/ipfs\/([^/?#]+)/);
    return match ? match[1] : null;
  }

  function imageUrlsFromUri(uri) {
    if (!uri) return [];
    if (uri.indexOf("http://") === 0 || uri.indexOf("https://") === 0) {
      return [uri];
    }
    var cid = extractIpfsCid(uri);
    if (!cid) return [];
    return [
      "https://assets.objkt.media/file/assets-003/" + cid + "/thumbnail",
      "https://assets.objkt.media/file/assets-003/" + cid + "/display",
      "https://dweb.link/ipfs/" + cid,
      "https://ipfs.io/ipfs/" + cid,
    ];
  }

  function createProjectCard(project) {
    var card = document.createElement("article");
    card.className = "card editart-card";

    var col1 = document.createElement("div");
    col1.className = "card__col-1";
    var col2 = document.createElement("div");
    col2.className = "card__col-2";

    var link = document.createElement("a");
    link.href = project.url;
    link.className = "link-image";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    var img = document.createElement("img");
    img.className = "editart-card__image";
    img.alt = project.name || "EditArt project";
    img.loading = "lazy";
    img.decoding = "async";

    var urls = imageUrlsFromUri(project.imageUri);
    var urlIndex = 0;
    img.onerror = function () {
      urlIndex += 1;
      if (urlIndex < urls.length) img.src = urls[urlIndex];
      else img.style.visibility = "hidden";
    };
    if (urls.length) img.src = urls[0];

    link.appendChild(img);
    col1.appendChild(link);

    var title = document.createElement("a");
    title.className = "title";
    title.href = project.url;
    title.target = "_blank";
    title.rel = "noopener noreferrer";
    title.textContent = project.name || "EditArt project";

    var desc = document.createElement("p");
    desc.className = "text editart-card__desc";
    desc.textContent = (project.description || "").replace(/\s+/g, " ").trim();

    var meta = document.createElement("p");
    meta.className = "tags editart-card__meta";
    meta.innerHTML =
      '<a href="' +
      project.url +
      '" target="_blank" rel="noopener noreferrer">editart.xyz</a>';

    col2.appendChild(title);
    if (desc.textContent) col2.appendChild(desc);
    col2.appendChild(meta);

    card.appendChild(col1);
    card.appendChild(col2);
    return card;
  }

  function fetchEditArtProjectsFromApi() {
    return fetch("https://api.editart.xyz/series")
      .then(function (res) {
        return res.json();
      })
      .then(function (all) {
        if (!Array.isArray(all)) return [];
        var creator =
          "tz1SvPd1aUYZSkr22JTdRzUEGMb6ZjoPEXTz";
        return all
          .filter(function (s) {
            return s.artistAddress === creator && s.mainnetContract;
          })
          .map(function (s) {
            return {
              name: s.name,
              url:
                "https://www.editart.xyz/series/" + s.mainnetContract,
              contract: s.mainnetContract,
              description: s.description || "",
            };
          });
      })
      .catch(function () {
        return [];
      });
  }

  function mergeProjects(jsonProjects, apiProjects) {
    var byContract = {};
    (jsonProjects || []).forEach(function (p) {
      if (p.contract) byContract[p.contract] = p;
    });
    apiProjects.forEach(function (p) {
      var prev = byContract[p.contract] || {};
      byContract[p.contract] = {
        name: prev.name || p.name,
        url: prev.url || p.url,
        contract: p.contract,
        description: prev.description || p.description,
        imageUri: prev.imageUri,
      };
    });
    return Object.keys(byContract)
      .map(function (k) {
        return byContract[k];
      })
      .sort(function (a, b) {
        return (a.name || "").localeCompare(b.name || "");
      });
  }

  window.loadEditArtProjects = function (containerId) {
    var container = document.getElementById(containerId || "editart-cards");
    if (!container) return;

    Promise.all([
      fetch("NFT.json").then(function (res) {
        if (!res.ok) throw new Error("NFT.json " + res.status);
        return res.json();
      }),
      fetchEditArtProjectsFromApi(),
    ])
      .then(function (results) {
        var config = results[0];
        var projects = mergeProjects(
          config && config.editArtProjects,
          results[1]
        );
        if (!projects.length) {
          container.innerHTML =
            '<p class="editart-cards__status"><span lang="pt-BR">Nenhum projeto EditArt em <code>NFT.json</code>.</span><span lang="en">No EditArt projects in <code>NFT.json</code>.</span></p>';
          return;
        }
        var grid = document.createElement("div");
        grid.className = "editart-grid";
        projects.forEach(function (project) {
          grid.appendChild(createProjectCard(project));
        });
        container.innerHTML = "";
        container.appendChild(grid);
      })
      .catch(function (err) {
        container.innerHTML =
          '<p class="editart-cards__status editart-cards__status--error"><span lang="pt-BR">Não foi possível carregar projetos EditArt.</span><span lang="en">Could not load EditArt projects.</span></p>';
        console.error("editart-cards:", err);
      });
  };
})();
