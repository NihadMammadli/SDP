import difflib
from functions.remover import remover

def lcs(X, Y):
    m, n = len(X), len(Y)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(m + 1):
        for j in range(n + 1):
            if i == 0 or j == 0:
                dp[i][j] = 0
            elif X[i - 1] == Y[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    return dp[m][n]

def cpp_checker(file1, file2):
    with open(file1, 'r') as f1, open(file2, 'r') as f2:
        code1 = f1.readlines()
        code2 = f2.readlines()

    code1_without_comments = remover(code1)
    code2_without_comments = remover(code2)

    common_lines_count = lcs(code1_without_comments, code2_without_comments)
    total_lines = max(len(code1_without_comments), len(code2_without_comments))

    similarity = common_lines_count / total_lines if total_lines > 0 else 0

    common_lines = set(code1_without_comments).intersection(code2_without_comments)

    return similarity, common_lines

