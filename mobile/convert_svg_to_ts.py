import os
import shutil

svg_src_path = r"C:\Users\ADMIN\Downloads\Environment-cuate.svg"
svg_dest_path = r"d:\EcoHabit\mobile\assets\environment_cuate.svg"
ts_path = r"d:\EcoHabit\mobile\src\components\home\EnvironmentCuateSvg.tsx"

# First, copy to assets directory
try:
    shutil.copy(svg_src_path, svg_dest_path)
    print(f"Copied {svg_src_path} to {svg_dest_path}")
except Exception as e:
    print(f"Error copying file: {e}")

with open(svg_dest_path, 'r', encoding='utf-8') as f:
    svg_content = f.read()

# Clean up newlines, escape backslashes and double quotes for JS string
svg_content_clean = svg_content.replace('\n', ' ').replace('\r', ' ').replace('\\', '\\\\').replace('"', '\\"')

ts_content = f"""import React from 'react';
import {{ SvgXml }} from 'react-native-svg';

const xml = "{svg_content_clean}";

interface EnvironmentCuateSvgProps {{
  width?: number | string;
  height?: number | string;
}}

export const EnvironmentCuateSvg: React.FC<EnvironmentCuateSvgProps> = ({{ width = "100%", height = "100%" }}) => {{
  return <SvgXml xml={{xml}} width={{width}} height={{height}} />;
}};

export default EnvironmentCuateSvg;
"""

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)

print("Successfully written EnvironmentCuateSvg.tsx")

