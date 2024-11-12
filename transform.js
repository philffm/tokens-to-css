function transformJSONToCSS(jsonString) {
    let coreCSS = '';
    let semanticCSS = '';
    let componentCSS = '';

    try {
        console.log('🔍 Starting JSON parsing...');
        const jsonData = JSON.parse(jsonString);
        console.log('✅ JSON parsed successfully!');

        const totalItems = jsonData.length;
        let processedItems = 0;

        jsonData.forEach((item) => {
            processedItems++;
            const progress = ((processedItems / totalItems) * 100).toFixed(2);
            console.log(`🔄 Processing item ${processedItems} of ${totalItems} (${progress}%)`);

            if (item.name === "1_Core") {
                console.log('🎨 Processing Core Variables...');
                coreCSS += '/* Core Variables */\n:root {\n';
                item.values.forEach(value => {
                    if (value.color) {
                        value.color.forEach(colorItem => {
                            if (colorItem.name && colorItem.value) {
                                coreCSS += `  --${colorItem.name.replace(/\//g, '-')}: ${colorItem.value};\n`;
                            }
                        });
                    }
                    if (value.typography) {
                        value.typography.forEach(typographyItem => {
                            if (typographyItem.name && typographyItem.value) {
                                coreCSS += `  --${typographyItem.name.replace(/\//g, '-')}: ${typographyItem.value};\n`;
                            }
                        });
                    }
                });
                coreCSS += '}\n\n';
                console.log('✅ Core Variables processed!');
            } else if (item.name === "2_Semantic") {
                console.log('🌈 Processing Semantic Variables...');
                semanticCSS += '/* Semantic Variables */\n';

                // Process number variables outside of mode classes
                item.values.forEach(value => {
                    if (value.number) {
                        value.number.forEach(numberItem => {
                            if (numberItem.name && numberItem.var) {
                                semanticCSS += `  --${numberItem.name.replace(/\//g, '-')}: var(--${numberItem.var.replace(/\//g, '-')});\n`;
                            }
                        });
                    }
                });

                // Process color variables within mode classes
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

                console.log('✅ Semantic Variables processed!');
            } else if (item.name === "3_Components") {
                console.log('🧩 Processing Component Variables...');
                componentCSS += '/* Component Variables */\n:root {\n';
                item.values.forEach(value => {
                    if (value.color) {
                        value.color.forEach(colorItem => {
                            if (colorItem.name && colorItem.var) {
                                componentCSS += `  --${colorItem.name.replace(/\//g, '-')}: var(--${colorItem.var.replace(/\//g, '-')});\n`;
                            }
                        });
                    }
                    if (value.typography) {
                        value.typography.forEach(typographyItem => {
                            if (typographyItem.name && typographyItem.var) {
                                componentCSS += `  --${typographyItem.name.replace(/\//g, '-')}: var(--${typographyItem.var.replace(/\//g, '-')});\n`;
                            }
                        });
                    }
                });
                componentCSS += '}\n\n';
                console.log('✅ Component Variables processed!');
            }
        });

    } catch (error) {
        coreCSS = 'Invalid JSON input';
        console.error('🚨 Oops! Something went wrong while parsing JSON! 🚨');
        console.error('🔍 Error Details:', error);
        console.error('📄 Please check your JSON format and try again.');
    }

    const cssOutput = coreCSS + semanticCSS + componentCSS;
    document.getElementById('outputCSS').textContent = cssOutput;

    return { coreCSS, semanticCSS, componentCSS };
}
