/**
 * fx(hash) project cards on NFT.html — NFT.json → fxhashProjects
 */

(function () {
  var FXHASH_GQL = "https://api.fxhash.xyz/graphql";
  var USER = "tz1SvPd1aUYZSkr22JTdRzUEGMb6ZjoPEXTz";

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
      "https://gateway.fxhash.xyz/ipfs/" + cid,
      "https://assets.objkt.media/file/assets-003/" + cid + "/thumbnail",
      "https://dweb.link/ipfs/" + cid,
      "https://ipfs.io/ipfs/" + cid,
    ];
  }

  function projectUrlFromApi(token) {
    if (token.slug) {
      return "https://www.fxhash.xyz/generative/slug/" + token.slug;
    }
    return "https://www.fxhash.xyz/generative/" + token.id;
  }

  function createProjectCard(project) {
    var card = document.createElement("article");
    card.className = "card fxhash-card";

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
    img.className = "fxhash-card__image";
    img.alt = project.name || "fx(hash) project";
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
    title.textContent = project.name || "fx(hash) project";

    var desc = document.createElement("p");
    desc.className = "text fxhash-card__desc";
    desc.textContent = (project.description || "").replace(/\s+/g, " ").trim();

    var meta = document.createElement("p");
    meta.className = "tags fxhash-card__meta";
    meta.innerHTML =
      '<a href="' +
      project.url +
      '" target="_blank" rel="noopener noreferrer">fxhash.xyz</a>';

    col2.appendChild(title);
    if (desc.textContent) col2.appendChild(desc);
    col2.appendChild(meta);

    card.appendChild(col1);
    card.appendChild(col2);
    return card;
  }

  function fetchFxhashProjectsFromApi() {
    return fetch(FXHASH_GQL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        query:
          'query { user(id: "' +
          USER +
          '") { generativeTokens { id name slug gentkContractAddress thumbnailUri displayUri metadata } } }',
      }),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (payload) {
        if (payload.errors || !payload.data || !payload.data.user) {
          return [];
        }
        return payload.data.user.generativeTokens.map(function (t) {
          var meta = t.metadata || {};
          return {
            name: t.name || meta.name,
            slug: t.slug,
            fxhashId: t.id,
            url: projectUrlFromApi(t),
            contract: t.gentkContractAddress,
            description: meta.description || "",
            imageUri:
              t.thumbnailUri || t.displayUri || meta.thumbnailUri || meta.displayUri,
          };
        });
      })
      .catch(function () {
        return [];
      });
  }

  function projectKey(p) {
    return (p.contract || "no-contract") + ":" + (p.fxhashId != null ? p.fxhashId : p.slug || p.name);
  }

  function mergeProjects(jsonProjects, apiProjects) {
    var byId = {};
    (jsonProjects || []).forEach(function (p) {
      byId[projectKey(p)] = p;
    });
    apiProjects.forEach(function (p) {
      var key = projectKey(p);
      var prev = byId[key] || {};
      byId[key] = {
        name: prev.name || p.name,
        slug: prev.slug || p.slug,
        fxhashId: prev.fxhashId != null ? prev.fxhashId : p.fxhashId,
        url: prev.url || p.url,
        contract: prev.contract || p.contract,
        description: prev.description || p.description,
        imageUri: prev.imageUri || p.imageUri,
      };
    });
    return Object.keys(byId)
      .map(function (k) {
        return byId[k];
      })
      .sort(function (a, b) {
        return (a.name || "").localeCompare(b.name || "");
      });
  }

  window.loadFxhashProjects = function (containerId) {
    var container = document.getElementById(containerId || "fxhash-cards");
    if (!container) return;

    Promise.all([
      fetch("NFT.json").then(function (res) {
        if (!res.ok) throw new Error("NFT.json " + res.status);
        return res.json();
      }),
      fetchFxhashProjectsFromApi(),
    ])
      .then(function (results) {
        var config = results[0];
        var projects = mergeProjects(config && config.fxhashProjects, results[1]);
        if (!projects.length) {
          container.innerHTML =
            '<p class="fxhash-cards__status"><span lang="pt-BR">Nenhum projeto fx(hash) em <code>NFT.json</code>.</span><span lang="en">No fx(hash) projects in <code>NFT.json</code>.</span></p>';
          return;
        }
        var grid = document.createElement("div");
        grid.className = "fxhash-grid";
        projects.forEach(function (project) {
          grid.appendChild(createProjectCard(project));
        });
        container.innerHTML = "";
        container.appendChild(grid);
      })
      .catch(function (err) {
        container.innerHTML =
          '<p class="fxhash-cards__status fxhash-cards__status--error"><span lang="pt-BR">Não foi possível carregar projetos fx(hash).</span><span lang="en">Could not load fx(hash) projects.</span></p>';
        console.error("fxhash-cards:", err);
      });
  };
})();
