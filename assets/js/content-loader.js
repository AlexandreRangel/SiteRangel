/**
 * Dynamic Content Loader for Alexandre Rangel's website
 * Loads and displays content from content.xml based on tags
 */

class ContentLoader {
  constructor() {
    this.contentCache = null;
  }

  /**
   * Load content entries filtered by tag
   * @param {Object} options - Configuration options
   * @param {string} options.tag - Tag to filter content by
   * @param {string} options.containerId - ID of container element to append cards
   * @param {boolean} options.showTitle - Whether to show a title section (default: false)
   * @param {string} options.titlePt - Portuguese title text
   * @param {string} options.titleEn - English title text
   * @param {boolean} options.excludeCurrentPage - Exclude current page from results (default: false)
   */
  loadContent(options = {}) {
    const config = {
      tag: '',
      containerId: 'cards',
      showTitle: false,
      titlePt: '',
      titleEn: '',
      excludeCurrentPage: false,
      ...options
    };

    // If content is already cached, use it
    if (this.contentCache) {
      this.filterAndDisplayContent(this.contentCache, config);
      return;
    }

    // Load content from XML
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        this.contentCache = this.xmlToJson(xmlhttp.responseXML).urlset.url;
        this.filterAndDisplayContent(this.contentCache, config);
      }
    };
    xmlhttp.open("GET", "content.xml", true);
    xmlhttp.send();
  }

  /**
   * Filter content by tag and display it
   */
  filterAndDisplayContent(pages, config) {
    const container = document.getElementById(config.containerId);
    if (!container) {
      console.error(`ContentLoader: Container with ID '${config.containerId}' not found`);
      return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Add title if requested
    if (config.showTitle && (config.titlePt || config.titleEn)) {
      this.addTitle(container, config.titlePt, config.titleEn);
    }

    // Create cards container
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards';
    container.appendChild(cardsContainer);

    // Current page URL for exclusion
    const currentPath = window.location.pathname;
    let foundEntries = 0;

    // Filter and create cards
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const tags = page.tags['#text'].toLowerCase();
      const pageUrl = page.loc['#text'];

      // Check if page matches tag
      if (tags.includes(config.tag.toLowerCase())) {
        // Skip current page if requested
        if (config.excludeCurrentPage && pageUrl.includes(currentPath.split('/').pop())) {
          continue;
        }

        this.createCard(page, cardsContainer);
        foundEntries++;
      }
    }

    // Show message if no entries found
    if (foundEntries === 0) {
      const noContentMsg = document.createElement('p');
      noContentMsg.innerHTML = `
        <span lang="pt-BR">Nenhum conteúdo encontrado para a tag "${config.tag}"</span>
        <span lang="en">No content found for tag "${config.tag}"</span>
      `;
      container.appendChild(noContentMsg);
    }
  }

  /**
   * Add title section
   */
  addTitle(container, titlePt, titleEn) {
    if (titlePt) {
      const titlePtEl = document.createElement('h3');
      titlePtEl.setAttribute('lang', 'pt-BR');
      titlePtEl.textContent = titlePt;
      container.appendChild(titlePtEl);
    }

    if (titleEn) {
      const titleEnEl = document.createElement('h3');
      titleEnEl.setAttribute('lang', 'en');
      titleEnEl.textContent = titleEn;
      container.appendChild(titleEnEl);
    }
  }

  /**
   * Create a content card
   */
  createCard(page, container) {
    const card = document.createElement("div");
    card.className = "card";

    const col1 = document.createElement("div");
    col1.className = "card__col-1";
    const col2 = document.createElement("div");
    col2.className = "card__col-2";

    // Image section
    const image = document.createElement("a");
    image.href = page.loc['#text'];
    image.className = "link-image";

    if (page.image['#text'].includes('hqdefault')) {
      image.classList.add('image-hq');
    } else if (page.image['#text'].includes('maxresdefault')) {
      image.classList.add('image-max');
    }

    const img = document.createElement("img");
    img.src = page.image['#text'];
    img.className = "image";
    // Prefer bilingual alt from content.xml name fields; never leave empty for content images
    const namePt = page.name_pt && page.name_pt['#text'] ? page.name_pt['#text'] : '';
    const nameEn = page.name_en && page.name_en['#text'] ? page.name_en['#text'] : '';
    if (namePt && nameEn && namePt !== nameEn) {
      img.alt = `${namePt} / ${nameEn}`;
    } else {
      img.alt = namePt || nameEn || 'Obra / Artwork';
    }

    const icon = document.createElement("span");
    icon.className = page.loc['#text'].includes('youtube.com') ? 
      "icon brands fa-youtube" : "icon brands fa-stack-overflow";

    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.appendChild(icon);

    image.appendChild(img);
    image.appendChild(overlay);

    // Text content section
    const text_en = document.createElement("span");
    text_en.className = "text";
    text_en.setAttribute("lang", "en");

    const text_pt_br = document.createElement("span");
    text_pt_br.className = "text";
    text_pt_br.setAttribute('lang', "pt-BR");

    const link_en = document.createElement("a");
    link_en.className = "title";
    link_en.setAttribute("lang", "en");

    const link_pt_br = document.createElement("a");
    link_pt_br.className = "title";
    link_pt_br.setAttribute("lang", "pt-BR");

    const tags = document.createElement("span");
    tags.className = "tags";

    // Set content
    link_en.href = page.loc['#text'];
    link_en.innerHTML = page.name_en['#text'];

    link_pt_br.href = page.loc['#text'];
    link_pt_br.innerHTML = page.name_pt['#text'];

    text_en.innerHTML = page.text_en['#text'];
    text_pt_br.innerHTML = page.text_pt['#text'];
    tags.innerHTML = this.createLinkTags(page.tags['#text']);

    // Assemble card
    container.appendChild(card);
    card.appendChild(col1);
    card.appendChild(col2);
    col1.appendChild(image);
    col2.appendChild(link_en);
    col2.appendChild(text_en);
    col2.appendChild(link_pt_br);
    col2.appendChild(text_pt_br);
    col2.appendChild(tags);
  }

  /**
   * Create clickable tag links
   */
  createLinkTags(tags) {
    const tmplist = tags.split('#');
    const hashlist = [];

    for (let w in tmplist) {
      if (w > 0) {
        const linktmp = `<a href="content.html?tag=${tmplist[w]}">#${tmplist[w]}</a>`;
        hashlist.push(linktmp);
      }
    }

    return hashlist.join('&nbsp;&nbsp;');
  }

  /**
   * Convert XML to JSON
   */
  xmlToJson(xml) {
    let obj = {};

    if (xml.nodeType === 1) { // element
      if (xml.attributes.length > 0) {
        obj["@attributes"] = {};
        for (let j = 0; j < xml.attributes.length; j++) {
          const attribute = xml.attributes.item(j);
          obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType === 3) { // text
      obj = xml.nodeValue;
    }

    if (xml.hasChildNodes()) {
      for (let i = 0; i < xml.childNodes.length; i++) {
        const item = xml.childNodes.item(i);
        const nodeName = item.nodeName;
        if (typeof (obj[nodeName]) === "undefined") {
          obj[nodeName] = this.xmlToJson(item);
        } else {
          if (typeof (obj[nodeName].push) === "undefined") {
            const old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(this.xmlToJson(item));
        }
      }
    }
    return obj;
  }
}

// Create global instance
window.contentLoader = new ContentLoader();

// Helper function for easy use
window.loadContentByTag = function(tag, containerId = 'cards', options = {}) {
  window.contentLoader.loadContent({
    tag: tag,
    containerId: containerId,
    ...options
  });
}; 