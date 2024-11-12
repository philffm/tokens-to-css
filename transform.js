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
                coreCSS += '/* Core Variables */\n<span class="css-selector">:root</span> {\n';
                item.values.forEach(value => {
                    if (value.color) {
                        value.color.forEach(colorItem => {
                            if (colorItem.name && colorItem.value && !colorItem.name.includes('unused')) {
                                coreCSS += `  <span class="css-property">--${colorItem.name.replace(/\//g, '-')}</span>: <span class="css-value">${colorItem.value}</span>;\n`;
                            }
                        });
                    }
                    if (value.number) {
                        value.number.forEach(numberItem => {
                            if (numberItem.name && numberItem.value && !numberItem.name.includes('unused')) {
                                coreCSS += `  <span class="css-property">--${numberItem.name.replace(/\//g, '-')}</span>: <span class="css-value">${numberItem.value}</span>;\n`;
                            }
                        });
                    }
                });
                coreCSS += '}\n\n';
                console.log('✅ Core Variables processed!');
            } else if (item.name === "2_Semantic") {
                console.log('🌈 Processing Semantic Variables...');
                semanticCSS += '/* Semantic Variables */\n<span class="css-selector">:root</span> {\n';

                item.values.forEach(value => {
                    if (value.number) {
                        value.number.forEach(numberItem => {
                            if (numberItem.name && numberItem.var && !numberItem.name.includes('unused')) {
                                semanticCSS += `  <span class="css-property">--${numberItem.name.replace(/\//g, '-')}</span>: <span class="css-value">var(--${numberItem.var.replace(/\//g, '-')})</span>;\n`;
                            }
                        });
                    }
                });

                item.values.forEach(value => {
                    if (value.mode && value.mode.name) {
                        const modeClass = value.mode.name.toLowerCase();
                        semanticCSS += `<span class="css-selector">.${modeClass}</span> {\n`;
                        if (value.color) {
                            value.color.forEach(colorItem => {
                                if (colorItem.name && colorItem.var && !colorItem.name.includes('unused')) {
                                    semanticCSS += `  <span class="css-property">--${colorItem.name.replace(/\//g, '-')}</span>: <span class="css-value">var(--${colorItem.var.replace(/\//g, '-')})</span>;\n`;
                                }
                            });
                        }
                        semanticCSS += '}\n\n';
                    }
                });

                semanticCSS += '}\n\n';
                console.log('✅ Semantic Variables processed!');
            } else if (item.name === "3_Components") {
                console.log('🧩 Processing Component Variables...');
                componentCSS += '/* Component Variables */\n<span class="css-selector">:root</span> {\n';
                item.values.forEach(value => {
                    if (value.color) {
                        value.color.forEach(colorItem => {
                            if (colorItem.name && colorItem.var && !colorItem.name.includes('unused')) {
                                componentCSS += `  <span class="css-property">--${colorItem.name.replace(/\//g, '-')}</span>: <span class="css-value">var(--${colorItem.var.replace(/\//g, '-')})</span>;\n`;
                            }
                        });
                    }
                    if (value.typography) {
                        value.typography.forEach(typographyItem => {
                            if (typographyItem.name && typographyItem.var && !typographyItem.name.includes('unused')) {
                                componentCSS += `  <span class="css-property">--${typographyItem.name.replace(/\//g, '-')}</span>: <span class="css-value">var(--${typographyItem.var.replace(/\//g, '-')})</span>;\n`;
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
    document.getElementById('outputCSS').innerHTML = cssOutput;

    return { coreCSS, semanticCSS, componentCSS };
}


document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('keydown', function (event) {
        // Check if CMD (or CTRL on Windows) and V are pressed
        if ((event.metaKey || event.ctrlKey) && event.key === 'v') {
            event.preventDefault();
            navigator.clipboard.readText().then(text => {
                document.getElementById('input').value = text;
                // showToast("✅ JSON pasted into input!");
                transformJSONToCSS(text);
            }).catch(err => {
                console.error('🚨 Failed to read clipboard contents: ', err);
            });
        }

        // Check if CMD (or CTRL on Windows) and C are pressed
        if ((event.metaKey || event.ctrlKey) && event.key === 'c') {
            event.preventDefault();
            const output = document.getElementById('outputCSS').textContent;
            navigator.clipboard.writeText(output).then(() => {
                showToast("✅ CSS copied to clipboard!");
            }).catch(err => {
                console.error('🚨 Failed to write to clipboard: ', err);
            });
        }
    });

    document.getElementById('input').addEventListener('input', function () {
        localStorage.setItem('jsonInput', this.value);
        transformJSONToCSS(this.value);
    });

    window.onload = function () {
        renderReadme();
        const savedInput = localStorage.getItem('jsonInput');
        if (savedInput) {
            document.getElementById('input').value = savedInput;
            transformJSONToCSS(savedInput);
        }
    };
});
