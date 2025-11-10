# Screenshot Plugin for [FM-DX-Webserver](https://github.com/NoobishSVK/fm-dx-webserver)

This plugin generates screenshots of the web server.

![image](https://github.com/user-attachments/assets/7fbd8625-c797-4c6b-8533-84a9bf9d11e0)



## Version 1.2 (only works from web server version 1.3.5!!!)

- Screenshot button now works again with a short press


## Installation notes:

1. [Download](https://github.com/Highpoint2000/webserver-screenshot/releases) the last repository as a zip
2. Unpack all files from the plugins folder to ..fm-dx-webserver-main\plugins\ 
3. Stop or close the fm-dx-webserver
4. Start/Restart the fm-dx-webserver with "npm run webserver" on node.js console, check the console informations
5. Activate the Screenshot plugin in the settings
6. Stop or close the fm-dx-webserver
7. Start/Restart the fm-dx-webserver with "npm run webserver" on node.js console, check the console informations

## Configuration options:

The following variables can be changed in the header of the screenshot.js:

    const defaultWidth = 1280;	// default is: 1280 
    const defaultHeight = 920; 	// default is: 920 
    const defaultTimeout = 1000;     // default is: 1000 

## Important notes:

- The plugin only works for publicly accessible web servers!!!
- The loading time of the screenshot depends on the number of elements (installed plugins)
- Since the screenshot is created by reloading the web server on the server side, only the elements that are active when loading are displayed

## Contact

If you have any questions, would like to report problems, or have suggestions for improvement, please feel free to contact me! You can reach me by email at highpoint2000@googlemail.com. I look forward to hearing from you!

<a href="https://www.buymeacoffee.com/Highpoint" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

<details>
<summary>History</summary>

### Version 1.1 (only works from web server version 1.3.5!!!)

- Design adjustments for web server version 1.3.5

### Version 1.0

- https and local network support
- PNG filename with metadata
- External server creates the snapshots (all plattforms are supported!)
