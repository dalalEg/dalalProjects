class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def evaluate_expression_tree(root):
    # אם העץ ריק
    if root is None:
        return 0

    # אם השורש הוא עלה (מספר)
    if root.left is None and root.right is None:
        return int(root.value)

    # חישוב תתי-העצים
    left_result = evaluate_expression_tree(root.left)
    right_result = evaluate_expression_tree(root.right)

    # ביצוע הפעולה שבשורש
    if root.value == '+':
        return left_result + right_result
    elif root.value == '-':
        return left_result - right_result
    elif root.value == '*':
        return left_result * right_result
    elif root.value == '/':
        return left_result / right_result
def in_order_traversal(root):
    if root is None:
        return []
    return in_order_traversal(root.left) + [root.value] + in_order_traversal(root.right)
# דוגמה: חישוב הביטוי ((3+2) * (5-1))
root = TreeNode('*')
root.left = TreeNode('+')
root.right = TreeNode('-')
root.left.left = TreeNode('3')
root.left.right = TreeNode('2')
root.right.left = TreeNode('5')
root.right.right = TreeNode('1')

print(in_order_traversal(root))  # פלט: 20