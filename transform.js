function transformJSONToCSS(jsonString) {
    let coreCSS = '';
    let semanticCSS = '';
    let componentCSS = '';

    try {
        const jsonData = JSON.parse(jsonString);

        jsonData.forEach((item) => {
            if (item.name === "1_Core") {
                coreCSS += '/* Core Variables */\n:root {\n';
                item.values.forEach(value => {
                    if (value.color) {
                        value.color.forEach(colorItem => {
                            if (colorItem.name && colorItem.value) {
                                coreCSS += `  --${colorItem.name.replace(/\//g, '-')}: ${colorItem.value};\n`;
                            }
                        });
                    }
                });
                coreCSS += '}\n\n';
            } else if (item.name === "2_Semantic") {
                semanticCSS += '/* Semantic Variables */\n';
                item.values.forEach(value => {
                    if (value.mode && value.mode.name) {
                        const modeClass = value.mode.name.toLowerCase();
                        semanticCSS += `.${modeClass} {\n`;
                        if (value.color) {
                            value.color.forEach(colorItem => {
                                if (colorItem.name && colorItem.var) {
                                    semanticCSS += `  --${colorItem.name.replace(/\//g, '-')}: var(--${colorItem.var.replace(/\//g, '-')});\n`;
                                }
                            });
                        }
                        semanticCSS += '}\n\n';
                    }
                });
            } else if (item.name === "3_Components") {
                componentCSS += '/* Component Variables */\n:root {\n';
                item.values.forEach(value => {
                    if (value.color) {
                        value.color.forEach(colorItem => {
                            if (colorItem.name && colorItem.var) {
                                componentCSS += `  --${colorItem.name.replace(/\//g, '-')}: var(--${colorItem.var.replace(/\//g, '-')});\n`;
                            }
                        });
                    }
                });
                componentCSS += '}\n\n';
            }
        });

    } catch (error) {
        coreCSS = 'Invalid JSON input';
        console.error('Error parsing JSON:', error);
    }

    const cssOutput = coreCSS + semanticCSS + componentCSS;
    document.getElementById('outputCSS').textContent = cssOutput;
}
