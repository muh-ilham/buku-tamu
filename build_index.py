import os
import re

base_dir = r"d:\DATA ILLANK\WEBSITE\Buku_Tamu"
index_path = os.path.join(base_dir, "index.html")
css_path = os.path.join(base_dir, "css.html")
js_path = os.path.join(base_dir, "js.html")
out_path = os.path.join(base_dir, "index_kirim.html")

with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

html = re.sub(r"<\?\!=\s*include\('css'\);\s*\?>", css, html)
html = re.sub(r"<\?\!=\s*include\('js'\);\s*\?>", js, html)

script_url = "https://script.google.com/macros/s/AKfycbyf_h9Fmom107ynrVmcLEPMwpux_RfahzyMpuWNpsEFYVlgrHErZvZbjePy0cILemvc/exec"
html = re.sub(r"<\?=\s*ScriptApp\.getService\(\)\.getUrl\(\)\s*\?>", script_url, html)

old_run_google_script = """    function runGoogleScript(funcName, ...args) {
        return new Promise((resolve, reject) => {
            if (typeof google === 'undefined' || typeof google.script === 'undefined') {
                reject(new Error("Lingkungan terbatas (Local)."));
                return;
            }

            var runner = google.script.run
                .withSuccessHandler(resolve)
                .withFailureHandler(reject);

            if (args && args.length > 0) runner[funcName].apply(runner, args);
            else runner[funcName]();
        });
    }"""

new_run_google_script = f"""    const GOOGLE_APP_URL = "{script_url}";

    async function runGoogleScript(actionName, ...args) {{
        try {{
            showLoading("Menghubungkan ke Server...");
            const payload = args.length > 0 ? args[0] : {{}};
            const requestData = {{ 
                action: actionName, 
                data: payload 
            }};

            const response = await fetch(GOOGLE_APP_URL, {{
                method: "POST",
                body: JSON.stringify(requestData)
            }});

            const result = await response.json();
            if (result.error) {{
                throw new Error(result.message);
            }}
            return result.data;
        }} catch (error) {{
            console.error("Fetch Error:", error);
            throw error;
        }} finally {{
            hideLoading();
        }}
    }}"""

html = html.replace(old_run_google_script, new_run_google_script)

with open(out_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Done index_kirim.html")
