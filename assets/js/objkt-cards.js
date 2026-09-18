/**
 * Cartões objkt na NFT.html — lista em NFT.json
 * Cada item: { "contract": "KT1...", "id": "123" } copiado da URL do objkt.com
 */

(function () {
  var OBJKT_GRAPHQL = "https://data.objkt.com/v3/graphql";
  var OBJKT_PLACEHOLDER_THUMBNAIL_CID =
    "QmNrhZHUaEqxhyLfqoq1mtHSipkWHeT31LNHb1QEbDHgnc";
  var TOKEN_FIELDS =
    "pk name description thumbnail_uri display_uri artifact_uri metadata fa_contract token_id mime lowest_ask supply";

  function extractIpfsCid(uri) {
    if (!uri) return null;
    if (uri.indexOf("ipfs://") === 0) {
      return uri.slice(7).split("?")[0].split("/")[0];
    }
    var match = uri.match(/\/ipfs\/([^/?#]+)/);
    return match ? match[1] : null;
  }

  function parseIpfsUri(uri) {
    if (!uri) return null;
    if (uri.indexOf("ipfs://") === 0) {
      var rest = uri.slice(7).split("?")[0];
      var slash = rest.indexOf("/");
      if (slash === -1) return { cid: rest, path: "" };
      return { cid: rest.slice(0, slash), path: rest.slice(slash + 1) };
    }
    var httpMatch = uri.match(/\/ipfs\/([^/?#]+)(\/[^?#]*)?/);
    if (!httpMatch) return null;
    var pathPart = (httpMatch[2] || "").replace(/^\//, "");
    return { cid: httpMatch[1], path: pathPart };
  }

  function objktCdnUrls(cid) {
    return [
      "https://assets.objkt.media/file/assets-003/" + cid + "/thumbnail",
      "https://assets.objkt.media/file/assets-003/" + cid + "/display",
      "https://assets.objkt.media/file/assets-003/" + cid + "/artifact",
    ];
  }

  function ipfsGatewayUrls(cid, pathSuffix) {
    var withPath = pathSuffix
      ? [
          "https://dweb.link/ipfs/" + cid + "/" + pathSuffix,
          "https://ipfs.io/ipfs/" + cid + "/" + pathSuffix,
          "https://gateway.pinata.cloud/ipfs/" + cid + "/" + pathSuffix,
        ]
      : [];
    return withPath.concat([
      "https://dweb.link/ipfs/" + cid,
      "https://ipfs.io/ipfs/" + cid,
      "https://gateway.pinata.cloud/ipfs/" + cid,
    ]);
  }

  function isObjktPlaceholderThumbnail(uri) {
    return extractIpfsCid(uri) === OBJKT_PLACEHOLDER_THUMBNAIL_CID;
  }

  function addCandidatesFromUri(uri, seen, out) {
    if (!uri || isObjktPlaceholderThumbnail(uri)) return;
    if (uri.indexOf("http://") === 0 || uri.indexOf("https://") === 0) {
      if (!seen[uri]) {
        seen[uri] = true;
        out.push(uri);
      }
      return;
    }
    var parsed = parseIpfsUri(uri);
    if (!parsed) return;
    if (parsed.path) {
      ipfsGatewayUrls(parsed.cid, parsed.path).forEach(function (url) {
        if (!seen[url]) {
          seen[url] = true;
          out.push(url);
        }
      });
    }
    objktCdnUrls(parsed.cid)
      .concat(ipfsGatewayUrls(parsed.cid, ""))
      .forEach(function (url) {
        if (!seen[url]) {
          seen[url] = true;
          out.push(url);
        }
      });
  }

  function buildImageCandidates(token) {
    var seen = {};
    var out = [];
    var mime = (token.mime || "").toLowerCase();
    var uris;
    if (mime.indexOf("video/") === 0) {
      uris = [
        token.thumbnail_uri,
        token.display_uri,
        token.artifact_uri,
        token._metaImage,
      ];
    } else if (mime.indexOf("svg") !== -1 || mime === "application/x-directory") {
      uris = [
        token.thumbnail_uri,
        token.display_uri,
        token.artifact_uri,
        token._metaImage,
      ];
    } else {
      uris = [
        token.artifact_uri,
        token.display_uri,
        token.thumbnail_uri,
        token._metaImage,
      ];
    }
    uris.forEach(function (uri) {
      addCandidatesFromUri(uri, seen, out);
    });
    return out;
  }

  var localNftManifest = null;
  var localNftManifestPromise = null;

  function localImageFilename(contract, id) {
    return contract + "_" + id + ".jpg";
  }

  function loadLocalNftManifest() {
    if (localNftManifest) return Promise.resolve(localNftManifest);
    if (localNftManifestPromise) return localNftManifestPromise;
    localNftManifestPromise = fetch("imagens/nft-images/manifest.json")
      .then(function (res) {
        if (!res.ok) return {};
        return res.json();
      })
      .catch(function () {
        return {};
      })
      .then(function (data) {
        localNftManifest = data || {};
        return localNftManifest;
      });
    return localNftManifestPromise;
  }

  function localPosterPath(token) {
    if (!localNftManifest) return null;
    var key = token.fa_contract + ":" + token.token_id;
    return localNftManifest[key] || null;
  }

  function resolveUsableLocalPoster(token) {
    var path = localPosterPath(token);
    if (!path) return Promise.resolve(null);
    return fetch(path, { method: "HEAD" })
      .then(function (res) {
        if (!res.ok) return null;
        var len = Number(res.headers.get("content-length") || 0);
        if (len > 0 && len < 4000) return null;
        return path;
      })
      .catch(function () {
        return null;
      });
  }

  function fetchJsonFromUrls(urls) {
    var index = 0;
    function tryNext() {
      if (index >= urls.length) {
        return Promise.reject(new Error("metadata fetch failed"));
      }
      var url = urls[index];
      index += 1;
      return fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error(String(res.status));
          return res.json();
        })
        .catch(tryNext);
    }
    return tryNext();
  }

  function enrichTokenMetadata(token) {
    if (token.display_uri || token.thumbnail_uri) {
      return Promise.resolve(token);
    }
    if (!token.metadata) return Promise.resolve(token);
    var cid = extractIpfsCid(token.metadata);
    if (!cid) return Promise.resolve(token);
    var metaUrls = ipfsGatewayUrls(cid);
    return fetchJsonFromUrls(metaUrls)
      .then(function (meta) {
        if (meta && meta.thumbnailUri) token._metaImage = meta.thumbnailUri;
        else if (meta && meta.image) token._metaImage = meta.image;
        else if (meta && meta.displayUri) token._metaImage = meta.displayUri;
        else if (meta && meta.artifactUri) token._metaImage = meta.artifactUri;
        return token;
      })
      .catch(function () {
        return token;
      });
  }

  function tokenObjktUrl(token) {
    return (
      "https://objkt.com/asset/" +
      encodeURIComponent(token.fa_contract) +
      "/" +
      encodeURIComponent(token.token_id)
    );
  }

  function formatPrice(mutez) {
    if (mutez == null || mutez === 0) return "";
    var xtz = Number(mutez) / 1000000;
    return xtz >= 1 ? xtz.toFixed(2) + " ꜩ" : xtz.toFixed(3) + " ꜩ";
  }

  function gql(query, variables) {
    return fetch(OBJKT_GRAPHQL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query, variables: variables || {} }),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (payload) {
        if (payload.errors && payload.errors.length) {
          throw new Error(payload.errors[0].message);
        }
        return payload.data;
      });
  }

  function fetchTokenEntry(entry) {
    if (entry.pk != null && String(entry.pk).indexOf("_") !== 0) {
      var qPk =
        "query($pks: [bigint!]!) { token(where: {pk: {_in: $pks}}) { " +
        TOKEN_FIELDS +
        " } }";
      return gql(qPk, { pks: [entry.pk] }).then(function (data) {
        return (data.token && data.token[0]) || null;
      });
    }
    if (entry.contract && entry.id != null) {
      var qAsset =
        "query($contract: String!, $id: String!) { token(where: {fa_contract: {_eq: $contract}, token_id: {_eq: $id}}) { " +
        TOKEN_FIELDS +
        " } }";
      return gql(qAsset, {
        contract: entry.contract,
        id: String(entry.id),
      }).then(function (data) {
        return (data.token && data.token[0]) || null;
      });
    }
    return Promise.resolve(null);
  }

  var BATCH_SIZE = 40;

  function fetchTokenBatch(entries) {
    if (!entries.length) return Promise.resolve([]);
    var parts = entries.map(function (entry) {
      var contract = String(entry.contract).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      var id = String(entry.id).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      return (
        "{fa_contract: {_eq: \"" +
        contract +
        "\"}, token_id: {_eq: \"" +
        id +
        "\"}}"
      );
    });
    var q =
      "query { token(where: {_or: [" +
      parts.join(",") +
      "]}) { " +
      TOKEN_FIELDS +
      " } }";
    return gql(q).then(function (data) {
      var byKey = {};
      (data.token || []).forEach(function (token) {
        byKey[token.fa_contract + ":" + token.token_id] = token;
      });
      return entries.map(function (entry) {
        return byKey[entry.contract + ":" + String(entry.id)] || null;
      });
    });
  }

  function enrichTokenBatch(tokens) {
    return Promise.all(
      tokens.map(function (token) {
        return token ? enrichTokenMetadata(token) : Promise.resolve(null);
      })
    );
  }

  function updateBatchProgress(statusEl, done, total) {
    statusEl.innerHTML =
      '<span lang="pt-BR">Carregando obras do objkt… ' +
      done +
      "/" +
      total +
      "</span><span lang=\"en\">Loading works from objkt… " +
      done +
      "/" +
      total +
      "</span>";
  }

  function normalizeTokenName(name) {
    return (name || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  /** One card per contract+id and per contract+name (remints share the same title). */
  function dedupeTokenEntries(entries) {
    var seenId = {};
    var seenName = {};
    var out = [];
    entries.forEach(function (entry) {
      var idKey = entry.contract + ":" + String(entry.id);
      if (seenId[idKey]) return;
      seenId[idKey] = true;
      var nameKey = entry.contract + ":" + normalizeTokenName(entry.name);
      if (entry.name && seenName[nameKey]) return;
      if (entry.name) seenName[nameKey] = true;
      out.push(entry);
    });
    return out;
  }

  function loadTokensInBatches(entries, container) {
    container.innerHTML = "";
    var statusEl = document.createElement("p");
    statusEl.className = "objkt-cards__status objkt-cards__progress";
    container.appendChild(statusEl);
    var grid = document.createElement("div");
    grid.className = "objkt-grid";
    container.appendChild(grid);

    var index = 0;
    var loaded = 0;
    var total = entries.length;
    updateBatchProgress(statusEl, 0, total);

    function nextBatch() {
      if (index >= entries.length) {
        if (loaded) {
          statusEl.remove();
        }
        return Promise.resolve(loaded);
      }
      var batch = entries.slice(index, index + BATCH_SIZE);
      index += BATCH_SIZE;
      return fetchTokenBatch(batch)
        .then(enrichTokenBatch)
        .then(function (tokens) {
          tokens.forEach(function (token) {
            if (!token) return;
            loaded += 1;
            grid.appendChild(createCard(token));
          });
          updateBatchProgress(statusEl, Math.min(index, total), total);
          return nextBatch();
        });
    }

    return nextBatch();
  }

  function createCard(token) {
    var card = document.createElement("div");
    card.className = "card objkt-card";

    var col1 = document.createElement("div");
    col1.className = "card__col-1";
    var col2 = document.createElement("div");
    col2.className = "card__col-2";

    var link = document.createElement("a");
    link.href = tokenObjktUrl(token);
    link.className = "link-image";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    var img = document.createElement("img");
    img.className = "objkt-card__image";
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.style.visibility = "hidden";

    var urls = buildImageCandidates(token);
    var urlIndex = 0;
    var placeholder = document.createElement("div");
    placeholder.className = "objkt-card__placeholder";
    placeholder.setAttribute("aria-hidden", "true");

    function showPlaceholder() {
      img.style.display = "none";
      if (!placeholder.parentNode) link.appendChild(placeholder);
    }

    function tryNextUrl() {
      img.style.display = "none";
      urlIndex += 1;
      if (urlIndex < urls.length) {
        img.src = urls[urlIndex];
      } else {
        showPlaceholder();
      }
    }

    function sampleImageBrightness(size) {
      if (!img.naturalWidth || !img.naturalHeight) return null;
      try {
        var canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return null;
        ctx.drawImage(img, 0, 0, size, size);
        var pixels = ctx.getImageData(0, 0, size, size).data;
        var sum = 0;
        for (var i = 0; i < pixels.length; i += 4) {
          sum += pixels[i] + pixels[i + 1] + pixels[i + 2];
        }
        return sum / (pixels.length / 4) / 3;
      } catch (e) {
        return null;
      }
    }

    function isLoadedImageTooDark() {
      var mean = sampleImageBrightness(12);
      return mean != null && mean < 18;
    }

    function isLoadedImageMask() {
      if (!img.naturalWidth || !img.naturalHeight) return false;
      try {
        var canvas = document.createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        var ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return false;
        ctx.drawImage(img, 0, 0, 16, 16);
        var pixels = ctx.getImageData(0, 0, 16, 16).data;
        var sum = 0;
        for (var p = 0; p < pixels.length; p += 4) {
          sum += pixels[p] + pixels[p + 1] + pixels[p + 2];
        }
        var mean = sum / (pixels.length / 4) / 3;
        function px(x, y) {
          var i = (y * 16 + x) * 4;
          return (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        }
        var center = px(8, 8);
        var edge =
          (px(1, 1) + px(14, 1) + px(1, 14) + px(14, 14)) / 4;
        if (center < 8 && edge > 230) return true;
        if (mean >= 45 && mean <= 80 && center < 15 && edge > 200) return true;
        return false;
      } catch (e) {
        return false;
      }
    }

    img.onload = function () {
      if (
        (isLoadedImageTooDark() || isLoadedImageMask()) &&
        urlIndex + 1 < urls.length
      ) {
        tryNextUrl();
        return;
      }
      img.alt = token.name || "NFT";
      img.style.visibility = "visible";
      if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
      img.style.display = "";
    };
    img.onerror = tryNextUrl;

    function startImageLoad() {
      if (urls.length) {
        img.src = urls[0];
      } else {
        showPlaceholder();
      }
    }

    resolveUsableLocalPoster(token).then(function (localPath) {
      if (localPath) {
        urls.unshift(localPath + "?v=7");
      }
      startImageLoad();
    });

    link.appendChild(img);
    col1.appendChild(link);

    var title = document.createElement("a");
    title.className = "title";
    title.href = tokenObjktUrl(token);
    title.target = "_blank";
    title.rel = "noopener noreferrer";
    title.textContent = token.name || "Untitled";

    var desc = document.createElement("p");
    desc.className = "text objkt-card__desc";
    desc.textContent = (token.description || "").replace(/\s+/g, " ").trim();

    var meta = document.createElement("p");
    meta.className = "tags objkt-card__meta";
    var price = formatPrice(token.lowest_ask);
    var supply =
      token.supply != null
        ? token.supply === 1
          ? "1/1"
          : token.supply + " editions"
        : "";
    meta.innerHTML =
      '<a href="' +
      tokenObjktUrl(token) +
      '" target="_blank" rel="noopener noreferrer">objkt.com</a>' +
      (supply ? " · " + supply : "") +
      (price ? " · from " + price : "");

    col2.appendChild(title);
    if (desc.textContent) col2.appendChild(desc);
    col2.appendChild(meta);

    card.appendChild(col1);
    card.appendChild(col2);
    return card;
  }

  function renderLoading(container) {
    container.innerHTML =
      '<p class="objkt-cards__status"><span lang="pt-BR">Carregando obras do objkt…</span><span lang="en">Loading works from objkt…</span></p>';
  }

  function renderError(container, message) {
    container.innerHTML =
      '<p class="objkt-cards__status objkt-cards__status--error"><span lang="pt-BR">Não foi possível carregar as obras do objkt. Verifique <code>NFT.json</code>.</span><span lang="en">Could not load works from objkt. Check <code>NFT.json</code>.</span></p>';
    console.error("objkt-cards:", message);
  }

  window.loadObjktFeaturedCards = function (containerId) {
    var container = document.getElementById(containerId || "objkt-cards");
    if (!container) return;

    renderLoading(container);

    fetch("NFT.json")
      .then(function (res) {
        if (!res.ok) throw new Error("NFT.json " + res.status);
        return res.json();
      })
      .then(function (config) {
        var excludedContracts = {};
        ((config && config.editArtProjects) || []).forEach(function (project) {
          if (project.contract) excludedContracts[project.contract] = true;
        });
        ((config && config.fxhashProjects) || []).forEach(function (project) {
          if (project.contract) excludedContracts[project.contract] = true;
        });
        var entries = dedupeTokenEntries(
          ((config && config.tokens) || []).filter(function (entry) {
            return !excludedContracts[entry.contract];
          })
        );
        if (!entries.length) {
          container.innerHTML =
            '<p class="objkt-cards__status"><span lang="pt-BR">Nenhuma obra em <code>NFT.json</code>.</span><span lang="en">No works in <code>NFT.json</code>.</span></p>';
          return null;
        }
        return loadLocalNftManifest().then(function () {
          return loadTokensInBatches(entries, container);
        });
      })
      .then(function (loaded) {
        if (loaded === 0) {
          renderError(container, "No matching tokens");
        }
      })
      .catch(function (err) {
        renderError(container, err);
      });
  };
})();
