function transformJSONToCSS(jsonString) {
    const cssSections = {
        core: '',
        semantic: '',
        component: ''
    };

    try {
        console.log('🔍 Starting JSON parsing...');
        const jsonData = JSON.parse(jsonString);
        console.log('✅ JSON parsed successfully!');

        // Filter out unused items at the beginning
        const filteredData = jsonData.map(item => {
            return {
                ...item,
                values: item.values.map(value => {
                    return {
                        ...value,
                        color: value.color ? value.color.filter(colorItem => !colorItem.name.includes('unused')) : [],
                        number: value.number ? value.number.filter(numberItem => !numberItem.name.includes('unused')) : [],
                        typography: value.typography ? value.typography.filter(typographyItem => !typographyItem.name.includes('unused')) : []
                    };
                })
            };
        });

        const totalItems = filteredData.length;
        let processedItems = 0;

        filteredData.forEach((item) => {
            processedItems++;
            const progress = ((processedItems / totalItems) * 100).toFixed(2);
            console.log(`🔄 Processing item ${processedItems} of ${totalItems} (${progress}%)`);

            if (item.name === "1_Core") {
                console.log('🎨 Processing Core Variables...');
                cssSections.core += '/* Core Variables */\n:root {\n';
                item.values.forEach(value => {
                    value.color.forEach(colorItem => {
                        if (colorItem.name && colorItem.value) {
                            cssSections.core += `  --${formatVariableName(colorItem.name)}: ${colorItem.value};\n`;
                        }
                    });
                    value.number.forEach(numberItem => {
                        if (numberItem.name && numberItem.value) {
                            cssSections.core += `  --${formatVariableName(numberItem.name)}: ${numberItem.value};\n`;
                        }
                    });
                    value.typography.forEach(typographyItem => {
                        if (typographyItem.name && typographyItem.value) {
                            cssSections.core += `  --${formatVariableName(typographyItem.name)}: "${typographyItem.value}";\n`;
                        }
                    });
                    // add also string values
                    value.string.forEach(stringItem => {
                        if (stringItem.name && stringItem.value) {
                            cssSections.core += `  --${formatVariableName(stringItem.name)}: "${stringItem.value}";\n`;
                        }
                    });
                });
                cssSections.core += '}\n';
                console.log(cssSections.core);
                console.log('✅ Core Variables processed!');
            } else if (item.name === "2_Semantic") {
                console.log('🌈 Processing Semantic Variables...');
                cssSections.semantic += '/* Semantic Variables */\n:root {\n';

                item.values.forEach(value => {
                    value.number.forEach(numberItem => {
                        if (numberItem.name && numberItem.var) {
                            cssSections.semantic += `  --${formatVariableName(numberItem.name)}: var(--${formatVariableName(numberItem.var)});\n`;
                        }
                    });
                    value.typography.forEach(typographyItem => {
                        if (typographyItem.name && typographyItem.var) {
                            cssSections.semantic += `  --${formatVariableName(typographyItem.name)}: var(--${formatVariableName(typographyItem.var)});\n`;
                        }
                    });
                });

                item.values.forEach(value => {
                    value.color.forEach(colorItem => {
                        if (colorItem.name && colorItem.var && colorItem.name.includes('fixed')) {
                            cssSections.semantic += `  --${formatVariableName(colorItem.name)}: var(--${formatVariableName(colorItem.var)});\n`;
                        }
                    });
                });

                cssSections.semantic += '}\n\n';

                item.values.forEach(value => {
                    if (value.mode && value.mode.name) {
                        const modeClass = value.mode.name.toLowerCase();
                        cssSections.semantic += `.${modeClass} {\n`;
                        value.color.forEach(colorItem => {
                            if (colorItem.name && colorItem.var && !colorItem.name.includes('fixed')) {
                                cssSections.semantic += `  --${formatVariableName(colorItem.name)}: var(--${formatVariableName(colorItem.var)});\n`;
                            }
                        });
                        cssSections.semantic += '}\n';
                    }
                });

                console.log('✅ Semantic Variables processed!');
            } else if (item.name === "3_Components") {
                console.log('🧩 Processing Component Variables...');
                cssSections.component += '/* Component Variables */\n:root {\n';
                item.values.forEach(value => {
                    value.color.forEach(colorItem => {
                        if (colorItem.name && colorItem.var) {
                            cssSections.component += `  --${formatVariableName(colorItem.name)}: var(--${formatVariableName(colorItem.var)});\n`;
                        }
                    });
                    value.typography.forEach(typographyItem => {
                        if (typographyItem.name && typographyItem.var) {
                            cssSections.component += `  --${formatVariableName(typographyItem.name)}: var(--${formatVariableName(typographyItem.var)});\n`;
                        }
                    });
                });
                cssSections.component += '}\n\n';
                console.log('✅ Component Variables processed!');
            }
        });

    } catch (error) {
        cssSections.core = 'Invalid JSON input';
        console.error('🚨 Oops! Something went wrong while parsing JSON! 🚨');
        console.error('🔍 Error Details:', error);
        console.error('📄 Please check your JSON format and try again.');
    }

    // Combine CSS sections
    const cssOutput = cssSections.core + cssSections.semantic + cssSections.component;

    // Filter out lines that contain '_unused'
    const filteredCSS = cssOutput.split('\n').filter(line => !line.trim().includes('_unused')).join('\n');

    // Output the filtered CSS
    document.getElementById('outputCSS').textContent = filteredCSS;

    return cssSections;
}

function formatVariableName(name) {
    return name.replace(/[\s/]/g, '-');
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
