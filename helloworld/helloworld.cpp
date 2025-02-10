#include <iostream>
#include <string>
#include <unordered_map>

using namespace std;

class Solution {
public:
    int maximumLength(string s) {
        unordered_map<string, int> mp;
        int m = -1;
        int length = s.length();
        for (int i = 0; i < length; ++i) {
            char ch = s[i];
            int j = i + 1;
            string st = "";
            st += ch;
            mp[st]++;
            while (j < length && s[j] == ch) {
                st += ch;
                mp[st]++;
                j++;
            }
        }
        for (const auto& a : mp) {
            if (a.second >= 3) {
                int l = a.first.length();
                m = max(l, m);
            }
        }
        return m;
    }
};

int main() {
    Solution sol;

    // Test 1: Empty string
    string test1 = "";
    cout << "Test 1 (empty string): " << sol.maximumLength(test1) << " (expected: -1)\n";

    // Test 2: String of length 1
    string test2 = "a";
    cout << "Test 2 (string of length 1): " << sol.maximumLength(test2) << " (expected: -1)\n";

    // Test 3: String of length 2
    string test3 = "aa";
    cout << "Test 3 (string of length 2): " << sol.maximumLength(test3) << " (expected: -1)\n";

    // Test 4: String with no repeating substrings
    string test4 = "abcdefg";
    cout << "Test 4 (no repeating substrings): " << sol.maximumLength(test4) << " (expected: -1)\n";

    // Test 5: String with one repeating substring of length 3
    string test5 = "abcabc";
    cout << "Test 5 (one repeating substring of length 3): " << sol.maximumLength(test5) << " (expected: 3)\n";

    // Test 6: String with multiple repeating substrings
    string test6 = "aabbcc";
    cout << "Test 6 (multiple repeating substrings): " << sol.maximumLength(test6) << " (expected: 2)\n";

    // Test 7: String with one repeating substring of length 4
    string test7 = "aabbccddee";
    cout << "Test 7 (one repeating substring of length 4): " << sol.maximumLength(test7) << " (expected: 4)\n";

    // Test 8: String with overlapping repeating substrings
    string test8 = "ababab";
    cout << "Test 8 (overlapping repeating substrings): " << sol.maximumLength(test8) << " (expected: 3)\n";

    // Test 9: String with nested repeating substrings
    string test9 = "ababcdcd";
    cout << "Test 9 (nested repeating substrings): " << sol.maximumLength(test9) << " (expected: 2)\n";

    // Test 10: String with edge case of 50 characters
    string test10 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    cout << "Test 10 (50 characters): " << sol.maximumLength(test10) << " (expected: 50)\n";

    // Test 11: String with one repeating substring of length 5
    string test11 = "abcabcabcabc";
    cout << "Test 11 (one repeating substring of length 5): " << sol.maximumLength(test11) << " (expected: 5)\n";

    // Test 12: String with multiple long repeating substrings
    string test12 = "aabbccddeeababcdcdababcdcd";
    cout << "Test 12 (multiple long repeating substrings): " << sol.maximumLength(test12) << " (expected: 2)\n";

    return 0;
}