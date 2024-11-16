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

        const totalItems = jsonData.length;
        let processedItems = 0;

        jsonData.forEach((item) => {
            processedItems++;
            const progress = ((processedItems / totalItems) * 100).toFixed(2);
            console.log(`🔄 Processing item ${processedItems} of ${totalItems} (${progress}%)`);

            if (item.name === "1_Core") {
                console.log('🎨 Processing Core Variables...');
                cssSections.core += '/* Core Variables */\n:root {\n';
                item.values.forEach(value => {
                    if (value.color) {
                        value.color.forEach(colorItem => {
                            if (colorItem.name && colorItem.value && !colorItem.name.includes('unused')) {
                                cssSections.core += `  --${formatVariableName(colorItem.name)}: ${colorItem.value};\n`;
                            }
                        });
                    }
                    if (value.number) {
                        value.number.forEach(numberItem => {
                            if (numberItem.name && numberItem.value && !numberItem.name.includes('unused')) {
                                cssSections.core += `  --${formatVariableName(numberItem.name)}: ${numberItem.value};\n`;
                            }
                        });
                    }
                });
                cssSections.core += '}\n\n';
                console.log('✅ Core Variables processed!');
            } else if (item.name === "2_Semantic") {
                console.log('🌈 Processing Semantic Variables...');
                cssSections.semantic += '/* Semantic Variables */\n:root {\n';

                item.values.forEach(value => {
                    if (value.number) {
                        value.number.forEach(numberItem => {
                            if (numberItem.name && numberItem.var && !numberItem.name.includes('unused')) {
                                cssSections.semantic += `  --${formatVariableName(numberItem.name)}: var(--${formatVariableName(numberItem.var)});\n`;
                            }
                        });
                    }
                });

                item.values.forEach(value => {
                    if (value.color) {
                        value.color.forEach(colorItem => {
                            if (colorItem.name && colorItem.var && !colorItem.name.includes('unused') && colorItem.name.includes('fixed')) {
                                cssSections.semantic += `  --${formatVariableName(colorItem.name)}: var(--${formatVariableName(colorItem.var)});\n`;
                            }
                        });
                    }
                });

                cssSections.semantic += '}\n\n';

                item.values.forEach(value => {
                    if (value.mode && value.mode.name) {
                        const modeClass = value.mode.name.toLowerCase();
                        cssSections.semantic += `.${modeClass} {\n`;
                        if (value.color) {
                            value.color.forEach(colorItem => {
                                if (colorItem.name && colorItem.var && !colorItem.name.includes('unused') && !colorItem.name.includes('fixed')) {
                                    cssSections.semantic += `  --${formatVariableName(colorItem.name)}: var(--${formatVariableName(colorItem.var)});\n`;
                                }
                            });
                        }
                        cssSections.semantic += '}\n\n';
                    }
                });

                console.log('✅ Semantic Variables processed!');
            } else if (item.name === "3_Components") {
                console.log('🧩 Processing Component Variables...');
                cssSections.component += '/* Component Variables */\n:root {\n';
                item.values.forEach(value => {
                    if (value.color) {
                        value.color.forEach(colorItem => {
                            if (colorItem.name && colorItem.var && !colorItem.name.includes('unused')) {
                                cssSections.component += `  --${formatVariableName(colorItem.name)}: var(--${formatVariableName(colorItem.var)});\n`;
                            }
                        });
                    }
                    if (value.typography) {
                        value.typography.forEach(typographyItem => {
                            if (typographyItem.name && typographyItem.var && !typographyItem.name.includes('unused')) {
                                cssSections.component += `  --${formatVariableName(typographyItem.name)}: var(--${formatVariableName(typographyItem.var)});\n`;
                            }
                        });
                    }
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

    // Cleanup function to remove duplicates
    function cleanCSSSection(section) {
        const lines = section.split('\n');
        const seen = new Set();
        return lines.filter(line => {
            const trimmedLine = line.trim();
            if (trimmedLine === '' || seen.has(trimmedLine)) {
                return false;
            }
            seen.add(trimmedLine);
            return true;
        }).join('\n');
    }

    // Clean each section
    for (const section in cssSections) {
        cssSections[section] = cleanCSSSection(cssSections[section]);
    }

    const cssOutput = cssSections.core + cssSections.semantic + cssSections.component;
    document.getElementById('outputCSS').textContent = cssOutput;

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
