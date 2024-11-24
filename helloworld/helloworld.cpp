#include <iostream>
#include <queue>
#include <vector>
#include <functional> // for std::greater

int main() {
    // Min-heap priority queue
    std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;

    // Inserting elements
    minHeap.push(30);
    minHeap.push(10);
    minHeap.push(20);

    // Printing elements in ascending order
    while (!minHeap.empty()) {
        std::cout << minHeap.top() << " ";
        minHeap.pop();
    }

    return 0;
}
