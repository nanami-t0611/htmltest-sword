class HostName {
  hostNames = {
    development: "http://localhost:3000",
    staging: "https://stg.api.call-asp.net",
    production: "https://api.call-asp.net"
  };

  getHostName = () => {
    const env = new URLSearchParams(window.location.search).get('env') || 'production';
    return this.hostNames[env];
  };
}

class CallaIdGenerator {
  constructor(hostName) {
    this.hostName = hostName;
  }

  shouldGenerateCallaId = () => {
    const params = new URL(window.location.href).searchParams;
    return !params.get('calla_id') && params.get('acode') && params.get('lcode') && params.get('mcode') && params.get('direct_link') === 'true';
  }

  fetchCallaId = async () => {
    if (!this.shouldGenerateCallaId()) {
      return new URLSearchParams(window.location.search).get('calla_id');
    }

    const params = new URLSearchParams(window.location.search);
    const requestUrl = `${this.hostName}/click?${params}`;

    try {
      const response = await fetch(requestUrl);
      if (!response.ok) {
        throw new Error('calla_id could not be generated');
      }
      const data = await response.json();
      return data.calla_id ?? '';
    } catch (error) {
      console.error('Error generating calla_id:', error);
      return null;
    }
  };

  addUrlWithCallaId = (callaId) => {
    if (!callaId) return;

    document.querySelectorAll('a[href^="http://"], a[href^="https://"], a[href^="/"], a[href^="//"]').forEach(link => {
      const linkUrl = new URL(link.href, window.location.origin);
      linkUrl.searchParams.set('calla_id', callaId);
      link.href = linkUrl.toString();
    });
  };
}

class PhoneNumberManager {
  constructor(hostName, callaId, replaceTel) {
    this.hostName = hostName;
    this.callaId = callaId;
    this.replaceTel = this.normalizePhoneNumber(replaceTel);
    this.phoneNumber = '';
    this.clickImageUrl = '';
    this.query = window.matchMedia("(max-width: 767px)");
  }

  getRequestUrl = () => {
    const callaId = this.callaId ?? '';
    const displaySourceUrl = encodeURIComponent(window.location.href);
    return `${this.hostName}/phone_number/?calla_id=${callaId}&display_source_url=${displaySourceUrl}`;
  }

  fetchPhoneNumber = async () => {
    if (this.phoneNumber !== '') return this.phoneNumber;

    try {
      const requestUrl = this.getRequestUrl();
      const response = await fetch(requestUrl);
      if (!response.ok) throw new Error(`Failed to fetch phone number: ${response.statusText}`);

      const json = await response.json();
      this.phoneNumber = json.phone_number;
      this.clickImageUrl = json.click_image_url;

      return this.phoneNumber
    } catch (error) {
      console.error(error.message);
      return null;
    }
  }

  replacePhoneNumber = () => {
    if (!this.phoneNumber) return;

    document.body.querySelectorAll('*:not(script)').forEach((node) => {
      this.replaceTextNodes(node);
      this.replaceLinkNodes(node);
      this.replaceSvgNodes(node);
    });

    this.phoneNumberReplaced = true;
  }

  replaceTextNodes = (node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE && this.normalizePhoneNumber(child.nodeValue).includes(this.replaceTel)) {
        child.nodeValue = this.normalizePhoneNumber(child.nodeValue).replace(this.replaceTel, this.phoneNumber);
      }
    });
  }

  replaceLinkNodes = (node) => {
    if (node.tagName !== 'A') return;

    const href = node.getAttribute('href');
    if (href && this.normalizePhoneNumber(href).includes(this.replaceTel)) {
      node.setAttribute('href', this.normalizePhoneNumber(href).replace(this.replaceTel, this.phoneNumber));
    }
  }

  replaceSvgNodes = (node) => {
    if (node.nodeName !== 'svg') return;

    const newSvgNode = this.recreateSvgNode(node, this.phoneNumber, this.replaceTel);
    this.recreateChildNodes(node, newSvgNode, this.phoneNumber, this.replaceTel);
    node.parentNode.replaceChild(newSvgNode, node);
  }

  recreateSvgNode = (node) => {
    const newSvgNode = document.createElementNS('http://www.w3.org/2000/svg', node.nodeName);
    for (let i = 0; i < node.attributes.length; i++) {
      let attributeValue = node.attributes[i].nodeValue;
      newSvgNode.setAttribute(node.attributes[i].nodeName, attributeValue);
    }
    return newSvgNode;
  }

  recreateChildNodes = (sourceNode, targetNode) => {
    sourceNode.childNodes.forEach((childNode) => {
      let newChildNode;

      if (childNode.nodeType === Node.ELEMENT_NODE) {
        newChildNode = document.createElementNS('http://www.w3.org/2000/svg', childNode.nodeName);
        this.recreateAttributes(newChildNode, childNode);
        this.recreateChildNodes(childNode, newChildNode);
      } else if (childNode.nodeType === Node.TEXT_NODE) {
        newChildNode = document.createTextNode(this.normalizePhoneNumber(childNode.nodeValue).replace(this.replaceTel, this.phoneNumber));
      }

      if (newChildNode) {
        targetNode.appendChild(newChildNode);
      }
    });
  }

  recreateAttributes = (newChildNode, childNode) => {
    for (let i = 0; i < childNode.attributes.length; i++) {
      let attributeValue = this.normalizePhoneNumber(childNode.attributes[i].nodeValue);
      if (attributeValue.includes(this.replaceTel)) {
        attributeValue = attributeValue.replace(this.replaceTel, this.phoneNumber);
      }
      newChildNode.setAttribute(childNode.attributes[i].nodeName, attributeValue);
    }
  }

  addClickEventReplacePhoneNumber = () => {
    if (this.replaceTel === '') return;

    document.querySelectorAll('.ct_click_replace, a[*|href^="tel:" i]').forEach(element => {
      if (element.tagName === 'A' || element.tagName === 'a') {

        let href = element.getAttribute('href') || element.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
        console.log(href);
        if (!this.normalizePhoneNumber(href).includes(this.replaceTel)) return;
      }

      const handleClickEvent = async (event) => {
        const callPhoneNumber = async () => {
          event.preventDefault();
          await this.fetchPhoneNumber();
          this.replacePhoneNumber();
          window.location.href = `tel:${this.phoneNumber}`;
        };

        const displayClickImage = async () => {
          if (!this.clickImageUrl) return;

          const styleManager = new StyleManager();

          const modalElement = document.createElement('div');
          styleManager.addModalStyle(modalElement);

          const clickImageImage = document.createElement('img');
          clickImageImage.src = this.clickImageUrl;
          styleManager.addClickImageStyle(clickImageImage);

          modalElement.appendChild(clickImageImage);
          document.body.appendChild(modalElement);

          clickImageImage.addEventListener('click', (event) => event.stopPropagation());
          clickImageImage.addEventListener('load', () => styleManager.displayModal(modalElement));
          modalElement.addEventListener('click', () => styleManager.hideModal(modalElement));
        };

        await callPhoneNumber();
        await displayClickImage();
      };

      element.addEventListener('click', handleClickEvent);
    });
  };

  isMobileDevice = () => {
    return this.query.matches
  };

  normalizePhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';

    return phoneNumber.replace(/-/g, '');
  }
}

class StyleManager {
  addOverlayPage = () => {
    this.style = document.createElement('style');
    this.style.innerHTML = `
      body:before {
        content: "";
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        z-index: 9999999;
      }
    `;

    document.head.appendChild(this.style);
  }

  removeOverlayPage = () => {
    this.style.innerHTML = '';
  }

  addModalStyle = (modalElement) => {
    modalElement.style.position = 'fixed';
    modalElement.style.top = '0';
    modalElement.style.left = '0';
    modalElement.style.width = '100%';
    modalElement.style.height = '100%';
    modalElement.style.background = 'rgba(0, 0, 0, 0.5)';
    modalElement.style.justifyContent = 'center';
    modalElement.style.alignItems = 'center';
    modalElement.style.zIndex = '9999999';
    modalElement.style.display = 'none';
  }

  displayModal = (modalElement) => {
    document.body.style.overflow = 'hidden';
    modalElement.style.display = 'flex';

  }

  hideModal = (modalElement) => {
    document.body.style.overflow = '';
    modalElement.style.display = 'none';
  }

  addClickImageStyle = (clickImageImage) => {
    clickImageImage.style.display = 'flex';
    clickImageImage.style.borderRadius = '5px';
    clickImageImage.style.objectFit = 'contain';
    clickImageImage.style.width = 'auto';
    clickImageImage.style.height = 'auto';
    clickImageImage.style.maxWidth = '90%';
    clickImageImage.style.maxHeight = '90%';
  };
};

const initialize = async () => {
  const styleManager = new StyleManager();
  styleManager.addOverlayPage();

  setTimeout(() => {
    styleManager.removeOverlayPage();
  }, 1000);

  const hostNameInstance = new HostName();
  const hostName = hostNameInstance.getHostName();

  const callaIdGenerator = new CallaIdGenerator(hostName);
  const callaId = await callaIdGenerator.fetchCallaId();

  if (!callaId) return styleManager.removeOverlayPage();

  const ctReplaceTel = typeof ct_replace_tel === "undefined" ? '' : ct_replace_tel;
  const phoneManager = new PhoneNumberManager(hostName, callaId, ctReplaceTel);

  if (!phoneManager.isMobileDevice()) await phoneManager.fetchPhoneNumber();

  const afterLoad = () => {
    callaIdGenerator.addUrlWithCallaId(callaId);

    if (!phoneManager.isMobileDevice()) {
      phoneManager.replacePhoneNumber();
    } else {
      phoneManager.addClickEventReplacePhoneNumber();
    }

    styleManager.removeOverlayPage();
  };

  document.readyState === 'complete' ? afterLoad() : window.addEventListener('load', afterLoad);
};

initialize();
