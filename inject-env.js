import fs from "fs";
import path from "path";

export const injectEnvVariables = () => {
  console.log("🔧 Starting environment variable injection...");
  const __dirname = path.resolve();
  const possibleBuildPaths = [
    path.join(__dirname, "frontend", "dist", "assets"),
  ];

  let buildPath = null;

  for (const testPath of possibleBuildPaths) {
    console.log("Testing path:", testPath);
    if (fs.existsSync(testPath)) {
      try {
        const files = fs.readdirSync(testPath);
        const jsFiles = files.filter((file) => file.endsWith(".js"));
        if (jsFiles.length > 0) {
          buildPath = testPath;
          console.log("✅ Found build directory with JS files at:", buildPath);
          break;
        }
      } catch (error) {
        console.log(`Error reading ${testPath}:`, error.message);
      }
    }
  }

  if (!buildPath) {
    console.error("❌ Build directory not found in any of these locations:");
    possibleBuildPaths.forEach((p) => console.error("   -", p));

    const distPath = path.join(__dirname, "frontend", "dist");
    if (fs.existsSync(distPath)) {
      console.error("📁 Contents of dist folder:");
      try {
        const distContents = fs.readdirSync(distPath);
        distContents.forEach((item) => {
          const itemPath = path.join(distPath, item);
          const isDir = fs.statSync(itemPath).isDirectory();
          console.error(`   ${isDir ? "📁" : "📄"} ${item}`);

          if (isDir) {
            try {
              const subContents = fs.readdirSync(itemPath);
              subContents.forEach((subItem) => {
                console.error(`     - ${subItem}`);
              });
            } catch (e) {
              console.error(`     (error reading ${item})`);
            }
          }
        });
      } catch (error) {
        console.error("   Error reading dist folder:", error.message);
      }
    }

    console.error(
      "Please run 'npm run build' in your frontend directory first."
    );
    return false;
  }

  try {
    const files = fs.readdirSync(buildPath);
    const jsFiles = files.filter((file) => file.endsWith(".js"));

    console.log(`📁 Found ${jsFiles.length} JavaScript files to process...`);

    if (jsFiles.length === 0) {
      console.warn("⚠️ No JavaScript files found in build directory.");
      return false;
    }

    let totalReplacements = 0;

    jsFiles.forEach((file) => {
      const filePath = path.join(buildPath, file);
      let content = fs.readFileSync(filePath, "utf8");
      let modified = false;

      const envMappings = {
        REACT_APP_API_BASE_URL_PLACEHOLDER: process.env.API_BASE_URL,
        REACT_APP_PINCODE_API_URL_PLACEHOLDER: process.env.PINCODE_API_URL,
        REACT_APP_APP_NAME_PLACEHOLDER: process.env.APP_NAME,
      };

      // Replace placeholders with actual values
      Object.entries(envMappings).forEach(([placeholder, value]) => {
        const regex = new RegExp(placeholder, "g");
        const matches = content.match(regex);

        if (matches) {
          content = content.replace(regex, value);
          modified = true;
          totalReplacements += matches.length;
          console.log(
            `✅ Replaced ${matches.length} occurrence(s) of ${placeholder} with "${value}" in ${file}`
          );
        }
      });

      // Write back the modified content if changes were made
      if (modified) {
        fs.writeFileSync(filePath, content, "utf8");
      }
    });

    if (totalReplacements > 0) {
      console.log(
        `✨ Successfully completed ${totalReplacements} environment variable replacements!`
      );
      return true;
    } else {
      console.warn(
        "⚠️ No placeholders found to replace. Check your React component placeholders."
      );
      return false;
    }
  } catch (error) {
    console.error("❌ Error during environment variable injection:", error);
    return false;
  }
};
