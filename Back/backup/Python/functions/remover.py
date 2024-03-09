import re

def remover(code):
    code_without_comments = []
    in_multiline_comment = False

    for line in code:
        line = re.sub(r'//.*', '', line)

        if in_multiline_comment:
            if '*/' in line:
                in_multiline_comment = False
            continue
        elif '/*' in line:
            in_multiline_comment = True
            if '*/' in line:
                in_multiline_comment = False
            line = line[:line.index('/*')]

        line = line.strip()
        if line and not line.startswith("int main() {") and not line.endswith("}")  and not re.match(r'^\s*{\s*}$', line) and not re.match(r'^return 0;', line) and not line.startswith("#include"):
            code_without_comments.append(line)

    return code_without_comments

