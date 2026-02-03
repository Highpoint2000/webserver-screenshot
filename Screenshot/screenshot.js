(() => {
    ////////////////////////////////////////////////////////////////////////
    ///                                                                  ///
    ///  SCREENSHOT CLIENT SCRIPT FOR FM-DX-WEBSERVER (V2.0)             ///
    ///                                                                  ///
    ///  by Highpoint                last update: 03.02.26               ///
    ///                                                                  ///
    ///  https://github.com/Highpoint2000/webserver-screenshot           ///
    ///                                                                  ///
    ////////////////////////////////////////////////////////////////////////
	
    const plugin_version = '2.0';
    const updateInfo = true; // Enable or disable version check

    // Inject the required library dynamically
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/dom-to-image-more/2.16.0/dom-to-image-more.min.js";
    document.head.appendChild(script);

    // Update Check Constants
    const plugin_name = "Screenshot";
    const plugin_path = "https://raw.githubusercontent.com/Highpoint2000/webserver-screenshot/";
    const plugin_JSfile = "main/screenshot.js";
    const pluginUpdateUrl = plugin_path + plugin_JSfile;
    const pluginHomepageUrl = "https://github.com/Highpoint2000/webserver-screenshot";

    let websocket;
    let picode = '', freq = '', itu = '', city = '', station = '';
    let storedPicode = '', storedFreq = '', storedITU = '', storedCity = '', storedStation = ''; 

    document.addEventListener('DOMContentLoaded', () => {
        setupWebSocket();
        if (updateInfo) {
            checkUpdate(false, plugin_name, pluginHomepageUrl, pluginUpdateUrl);
        }
    });

    // ───────────────────────────────────────────────────────────────
    // Update Check Logic
    // ───────────────────────────────────────────────────────────────

    function checkUpdate(setupOnly, pluginName, urlUpdateLink, urlFetchLink) {
        const isSetupPath = (window.location.pathname || "/").indexOf("/setup") >= 0;
        const ver = typeof plugin_version !== "undefined" ? plugin_version : "Unknown";

        fetch(urlFetchLink, { cache: "no-store" })
            .then((r) => r.text())
            .then((txt) => {
                let remoteVer = "Unknown";
                const match = txt.match(/const\s+plugin_version\s*=\s*['"]([^'"]+)['"]/);
                if (match) remoteVer = match[1];

                if (remoteVer !== "Unknown" && remoteVer !== ver) {
                    console.log(`[${pluginName}] Update available: ${ver} -> ${remoteVer}`);
                    
                    if (typeof sendToast === 'function') {
                        sendToast('warning important', `${pluginName}`, `Update available:<br>${ver} -> ${remoteVer}`, false, false);
                    }

                    if (!setupOnly || isSetupPath) {
                        const settings = document.getElementById("plugin-settings");
                        if (settings) settings.innerHTML += `<br><a href="${urlUpdateLink}" target="_blank">[${pluginName}] Update: ${ver} -> ${remoteVer}</a>`;
                        
                        const updateIcon =
                            document.querySelector(".wrapper-outer #navigation .sidenav-content .fa-puzzle-piece") ||
                            document.querySelector(".wrapper-outer .sidenav-content") ||
                            document.querySelector(".sidenav-content");
                        
                        if (updateIcon) {
                            if (!updateIcon.querySelector(`.${pluginName}-update-dot`)) {
                                const redDot = document.createElement("span");
                                redDot.classList.add(`${pluginName}-update-dot`);
                                redDot.style.cssText = `
                                    display: block;
                                    width: 12px;
                                    height: 12px;
                                    border-radius: 50%;
                                    background-color: #FE0830;
                                    margin-left: 82px;
                                    margin-top: -12px;
                                `;
                                updateIcon.appendChild(redDot);
                            }
                        }
                    }
                }
            })
            .catch((e) => { console.error(`Update check for ${pluginName} failed`, e); });
    }

    // ───────────────────────────────────────────────────────────────
    // Screenshot Logic
    // ───────────────────────────────────────────────────────────────

    function handleScreenshotRequest() {
        if (typeof domtoimage === 'undefined') {
            sendToast('error', 'Screenshot', 'Library is loading, please wait...', false, false);
            return;
        }

        storedPicode = picode;
        storedFreq = freq;
        storedITU = itu;
        storedCity = city;
        storedStation = station;

        sendToast('info important', 'Screenshot', `Processing - please wait!`, false, false);

        const node = document.body;
        const width = node.offsetWidth;
        const height = node.offsetHeight;

        const computedStyle = window.getComputedStyle(document.body);
        const currentFont = computedStyle.fontFamily;

        const config = {
            quality: 1,
            scale: 1, 
            width: width,
            height: height,
            // Filter removed so the button is visible in the screenshot
            cacheBust: true, 
            style: {
                'font-family': currentFont, 
                'transform': 'none',
                '-webkit-font-smoothing': 'antialiased',
                '-moz-osx-font-smoothing': 'grayscale'
            }
        };

        domtoimage.toPng(node, config)
            .then(function (dataUrl) {
                downloadDataUrl(dataUrl);
            })
            .catch(function (error) {
                console.error('Error creating screenshot:', error);
                console.log("Attempting fallback...");
                // Filter also removed in fallback
                domtoimage.toPng(node, { quality: 0.9, cacheBust: true })
                    .then(downloadDataUrl)
                    .catch(err => sendToast('error important', 'Screenshot', `Error: ${err.message}`));
            });
    }

    function downloadDataUrl(dataUrl) {
        const date = new Date();
        const dateString = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
        const timeString = date.toTimeString().slice(0, 8).replace(/:/g, '');  // HHMMSS

        const parts = [dateString, timeString];

        if (storedFreq) parts.push(storedFreq);
        if (storedPicode) parts.push(storedPicode);
        if (storedStation) parts.push(storedStation);
        if (storedCity) parts.push(storedCity);
        if (storedITU) parts.push(`[${storedITU}]`);

        const filename = parts.filter(Boolean).join('_') + '.png';

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // ───────────────────────────────────────────────────────────────
    // WebSocket Logic
    // ───────────────────────────────────────────────────────────────

    async function handleWebSocketMessage(event) {
        try {
            const data = JSON.parse(event.data);
            picode = (data.pi || '').replace(/\?/g, '');
            freq = (data.freq || '').replace(/\?/g, '');
            itu = (data.txInfo.itu || '').replace(/\?/g, '');
            city = (data.txInfo.city || '').replace(/\?/g, '');
            station = (data.txInfo.tx || '').replace(/\?/g, '');
        } catch (error) {
            console.error("Error processing the message:", error);
        }
    }

    async function setupWebSocket() {
        if (!websocket || websocket.readyState === WebSocket.CLOSED) {
            try {
                websocket = await window.socketPromise;

                websocket.addEventListener("open", () => {
                    if (typeof debugLog === 'function') debugLog("WebSocket connected.");
                    else console.log("WebSocket connected.");
                });

                websocket.addEventListener("message", handleWebSocketMessage);

                websocket.addEventListener("close", (event) => {
                    console.log("WebSocket connection closed, retrying in 5 seconds.");
                    setTimeout(setupWebSocket, 5000);
                });

            } catch (error) {
                console.error("Error during WebSocket setup:", error);
            }
        }
    }

    // ───────────────────────────────────────────────────────────────
    // UI Button & CSS Fix
    // ───────────────────────────────────────────────────────────────
    function createButton(buttonId) {
      (function waitForFunction() {
        const maxWaitTime = 10000;
        let functionFound = false;

        const observer = new MutationObserver((mutationsList, observer) => {
          if (typeof addIconToPluginPanel === 'function') {
            observer.disconnect();
            
            // FIX: Using non-breaking spaces (\u00A0) to prevent line wrap in tooltip
            const tooltipText = `Plugin\u00A0Version:\u00A0${plugin_version}`;
            
            addIconToPluginPanel(buttonId, "Screenshot", "solid", "camera", tooltipText);
            functionFound = true;

            const buttonObserver = new MutationObserver(() => {
              const $pluginButton = $(`#${buttonId}`);
              if ($pluginButton.length > 0) {
                $pluginButton.on('click', handleScreenshotRequest);
                buttonObserver.disconnect();
              }
            });
            buttonObserver.observe(document.body, { childList: true, subtree: true });
          }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
          observer.disconnect();
          if (!functionFound) {
            console.error(`Function addIconToPluginPanel not found after ${maxWaitTime / 1000} seconds.`);
          }
        }, maxWaitTime);
      })();

      const aScreenshotCss = `
        #${buttonId}:hover {
          color: var(--color-5);
          filter: brightness(120%);
          cursor: pointer;
        }
        
        /* FIX: Prevents line wrap in tooltip via CSS */
        #${buttonId}:after, 
        #${buttonId}::after,
        [data-tooltip="Plugin Version: ${plugin_version}"] {
             white-space: nowrap !important;
             max-width: none !important;
             width: auto !important;
        }
      `;
      
      $("<style>")
        .prop("type", "text/css")
        .html(aScreenshotCss)
        .appendTo("head");
    }

    createButton('Screenshot');
})();