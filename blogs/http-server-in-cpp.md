---
title: "Building a Custom HTTP Server from Scratch in C++"
description: "Demystifying low-level UNIX network sockets, object-oriented socket abstractions, and crafting a minimal HTTP/1.1 web server in modern C++."
date: "Sep 17, 2026"
tags: ["C++", "Networking", "Systems", "Sockets", "HTTP"]
readTime: "6 min read"
author: "Garvit Singla"
githubUrl: "https://github.com/garvittsingla/http-server-cpp"
likes: 64
views: 920
---

Most web developers interact with web servers through high-level abstractions like Express, FastAPI, or Actix. We type `app.listen(8080)` and take for granted the intricate operating system plumbing running beneath our feet.

To truly understand how backend systems work, I decided to build a custom **HTTP/1.1 server from scratch in C++** using raw Berkeley UNIX sockets.

In this article, I'll walk through the architectural design, object-oriented socket hierarchy, and how we listen for TCP handshakes and serve real HTTP responses.

> Full source code is open source on GitHub: [garvittsingla/http-server-cpp](https://github.com/garvittsingla/http-server-cpp).

---

## The Big Picture: How Web Traffic Actually Works

At the lowest level, an HTTP server is just a user-space program asking the operating system kernel for a communication endpoint (a **socket**), binding it to a local network interface and port, and waiting in an infinite loop for clients to send bytes.

```text
[ Client (Browser / cURL) ]
             |
             v  TCP 3-Way Handshake (SYN, SYN-ACK, ACK)
[ Kernel TCP Stack ]
             |
             v  accept() extracts connection from backlog
[ Server Process (C++) ]
  - recv()   -> reads raw HTTP request string
  - parse()  -> extracts Method, Route, Headers
  - send()   -> writes raw HTTP/1.1 response
  - close()  -> terminates TCP socket
```

Instead of putting all raw C socket system calls into one massive, messy 400-line `main.cpp`, I designed a modular, object-oriented hierarchy under the `HDE` namespace.

---

## 1. The Foundation: `HDE::SimpleSocket`

Every network socket in UNIX requires initializing a `struct sockaddr_in` address structure, specifying the address family (`AF_INET` for IPv4), byte-ordering conversion functions (`htons` and `htonl`), and instantiating the socket file descriptor via `socket()`.

Here is the abstract base class:

```cpp
// Networking/SimpleSocket.hpp
namespace HDE {
    class SimpleSocket {
        private:
            struct sockaddr_in address; // IP + port structure
            int sock;                   // File descriptor handle
            int connection;             // Connection status code
        public:
            SimpleSocket(int domain, int service, int protocol, int port, u_long interface); 
            
            // Pure virtual method: forces derived classes to specify connection behavior
            virtual int connect_to_network(int sock, struct sockaddr_in address) = 0;
            
            void test_connection(int item_to_test);
            struct sockaddr_in get_address();
            int get_sock();
            int get_connection();
            void set_connection(int conn);
    };
}
```

### Implementing Socket Creation

In `SimpleSocket.cpp`, we construct the socket and convert the port and interface to network byte order (Big Endian):

```cpp
#include "SimpleSocket.hpp"

HDE::SimpleSocket::SimpleSocket(int domain, int service, int protocol, int port, u_long interface) {
    address.sin_family = domain;
    address.sin_port = htons(port);
    address.sin_addr.s_addr = htonl(interface);
    
    // Request a socket file descriptor from kernel
    sock = socket(domain, service, protocol);
    test_connection(sock);
}

void HDE::SimpleSocket::test_connection(int item_to_test) {
    if (item_to_test < 0) {
        perror("Socket creation failed");
        exit(EXIT_FAILURE);
    }
}
```

Notice the pure virtual `connect_to_network()` function. A client socket uses `connect()`, whereas a server socket uses `bind()`. By declaring it pure virtual, `SimpleSocket` cannot be accidentally instantiated on its own.

---

## 2. Binding to an Interface: `HDE::BindingSocket`

Once a socket descriptor is allocated, we must bind it to an IP address and port on the host machine. This tells the kernel: *"Any traffic arriving on port 8080 belongs to this file descriptor."*

```cpp
// Networking/BindingSocket.cpp
#include "BindingSocket.hpp"
#include <sys/socket.h>

HDE::BindingSocket::BindingSocket(int domain, int service, int protocol, int port, u_long interface)
    : SimpleSocket(domain, service, protocol, port, interface) {

    int conn = connect_to_network(get_sock(), get_address());
    set_connection(conn);
    test_connection(get_connection());
}

int HDE::BindingSocket::connect_to_network(int sock, struct sockaddr_in address) {
    return bind(sock, (struct sockaddr*)&address, sizeof(address));
}
```

By overriding `connect_to_network`, we invoke the POSIX `bind()` system call seamlessly during initialization.

---

## 3. Entering the Passive State: `HDE::ListeningSocket`

A bound socket cannot accept incoming connections until it is explicitly switched into **passive listening mode** via `listen()`. We also specify a `backlog` parameter, which defines the maximum length of the queue of pending connections.

```cpp
// Networking/ListeningSocket.cpp
#include "ListeningSocket.hpp"
#include <sys/socket.h>

HDE::ListeningSocket::ListeningSocket(int domain, int service, int protocol, int port, u_long interface, int bklg)
    : BindingSocket(domain, service, protocol, port, interface) {
    
    backlog = bklg;
    start_listening();
    test_connection(listening);
}

void HDE::ListeningSocket::start_listening() {
    listening = listen(get_sock(), backlog);
}
```

With just three focused classes, we have encapsulated socket creation, network binding, and listener state with robust error checking at each phase.

---

## 4. The Server Event Loop: Handling Incoming Requests

Now comes the fun part: serving real HTTP requests in `berner.cpp`.

```cpp
#include "Networking/ListeningSocket.hpp"
#include <iostream>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <cstring>

int main() {
    // Listen on IPv4 (AF_INET), TCP (SOCK_STREAM), Port 8080, Any Interface, Backlog 10
    HDE::ListeningSocket serverSocket(
        AF_INET, SOCK_STREAM, 0, 8080, INADDR_ANY, 10
    );

    std::cout << "Server listening on port 8080..." << std::endl;

    while (true) {
        struct sockaddr_in client_address;
        socklen_t address_len = sizeof(client_address);

        // 1. Accept incoming TCP connection
        int client_fd = accept(
            serverSocket.get_sock(),
            (struct sockaddr*)&client_address,
            &address_len
        );

        if (client_fd < 0) {
            perror("accept failed");
            continue;
        }

        // Print connecting client's IP address
        char client_ip[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, &client_address.sin_addr, client_ip, INET_ADDRSTRLEN);
        std::cout << "Connection received from " << client_ip << std::endl;

        // 2. Read the raw HTTP request bytes
        char buffer[1024];
        ssize_t bytes_received = recv(client_fd, buffer, sizeof(buffer) - 1, 0);
        if (bytes_received < 0) {
            perror("recv failed");
            close(client_fd);
            continue;
        }
        buffer[bytes_received] = '\0';
        std::cout << "Request payload:\n" << buffer << std::endl;

        // 3. Format valid HTTP/1.1 response
        const char* response =
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: text/plain\r\n"
            "Content-Length: 2\r\n"
            "\r\n"
            "Hi";

        // 4. Send response & terminate client socket
        send(client_fd, response, strlen(response), 0);
        close(client_fd);
    }

    return 0;
}
```

---

## Testing the Server

We compile using standard C++17 with `-Wall` flags:

```bash
g++ -std=c++17 -Wall -I. \
  berner.cpp \
  Networking/SimpleSocket.cpp \
  Networking/BindingSocket.cpp \
  Networking/ListeningSocket.cpp \
  -o server
```

Run the binary:

```bash
./server
# Output: Server listening on port 8080...
```

Now fire up a terminal and test it with cURL:

```bash
curl -i http://localhost:8080
```

Response:

```http
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 2

Hi
```

It works! The browser and cURL parse our headers and body seamlessly because our byte stream strictly respects the RFC 2616 HTTP specification.

---

## What's Next: Concurrency & Epoll

This simple server uses a synchronous, blocking model—it handles one connection at a time before calling `accept()` again.

In production servers (like Nginx), scalability is achieved by using non-blocking I/O multiplexing:
- **`select` / `poll`**: Cross-platform but $O(N)$ scanning overhead.
- **`epoll` on Linux** or **`kqueue` on macOS / BSD**: $O(1)$ event notifications triggered by ready file descriptors.
- **Thread Pools**: Worker threads consuming client sockets from a thread-safe queue.

Building this project demystified the magic of the web stack for me. Every framework you use is ultimately built on these exact primitives.

Check out the full repository on GitHub: [garvittsingla/http-server-cpp](https://github.com/garvittsingla/http-server-cpp).
