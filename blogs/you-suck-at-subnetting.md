---
title: "You suck at Subnetting"
description: "A comprehensive, intuition-first breakdown of IPv4 address allocation, CIDR notation, subnet masks, and how network engineers divide host ranges without wasting precious address space."
date: "Jun 12, 2026"
tags: ["Networking", "Subnetting", "Systems", "IPv4"]
readTime: "4 min read"
author: "Garvit Singla"
xUrl: "https://x.com/garvitsinglaa/status/2065482303347085350"
likes: 42
views: 680
---

I was studying for my Computer Networks exam late at night, and I came across a topic that almost every computer science student dreads at first: **Subnetting**.

Most textbooks throw binary math at you right away: *255.255.255.192, AND operations, borrow 3 bits, calculate magic numbers*. But when you strip away the convoluted formulas, subnetting is just a clean, logical puzzle of organizing computers into neighborhoods.

Here is the intuition behind how a single IPv4 address block is partitioned across different departments, branches, and organizations without burning through scarce address space.

---

## The Core Problem: Why Subnet at All?

An IPv4 address consists of **32 bits**, typically written in dotted-decimal format:

```text
192.168.1.1  =>  11000000 . 10101000 . 00000001 . 00000001
```

In the early days of the Internet, addresses were categorized into rigid classes (Class A, Class B, Class C). If a company needed 300 IP addresses, a Class C network (254 usable hosts) was too small, so they were granted a Class B network (65,534 usable hosts).

The result? Over **65,000 addresses were completely wasted**.

Subnetting—and specifically **Classless Inter-Domain Routing (CIDR)**—was invented to solve this exact problem by decoupling network boundaries from octet octets.

---

## Anatomy of an IP Address: Network vs Host

Every IP address has two responsibilities:
1. **Network ID**: Which street or neighborhood the packet belongs to.
2. **Host ID**: Which specific apartment unit on that street receives the packet.

The **Subnet Mask** tells routers where the Network ID ends and where the Host ID begins:

```text
IP Address:   192.168.1.50   ->  11000000.10101000.00000001.00110010
Subnet Mask:  255.255.255.0  ->  11111111.11111111.11111111.00000000
                                 [------- Network ID -------] [ Host ]
```

When you see `/24` (CIDR notation), it literally means: **the first 24 bits are fixed as the network prefix**. The remaining 8 bits ($32 - 24 = 8$) are left for hosts:

$$\text{Usable Hosts} = 2^{\text{host bits}} - 2 = 2^8 - 2 = 254$$

Why subtract 2?
- **All 0s in host portion**: Represents the Network Address itself.
- **All 1s in host portion**: Represents the Broadcast Address for everyone in that subnet.

---

## Borrowing Bits: The Subnetting Trick

Suppose your organization is assigned `192.168.1.0/24`, but you have 4 separate teams:
- Engineering (50 people)
- Design (25 people)
- Sales (20 people)
- Operations (15 people)

Instead of begging for 4 separate Class C ranges, we **borrow bits from the host portion**:

To create at least 4 subnets, we need $2^n \ge 4 \implies n = 2$ bits.

Now our subnet mask increases from `/24` to `/26` (`24 + 2 = 26`):

```text
New Mask: 255.255.255.192 (/26)
Remaining Host bits: 32 - 26 = 6 bits
Hosts per subnet: 2^6 - 2 = 62 usable hosts
```

Each subnet has a step size (block size) of $256 - 192 = 64$:

| Subnet | Network Address | Usable Host Range | Broadcast Address |
| :--- | :--- | :--- | :--- |
| **Engineering** | `192.168.1.0/26` | `192.168.1.1` – `192.168.1.62` | `192.168.1.63` |
| **Design** | `192.168.1.64/26` | `192.168.1.65` – `192.168.1.126` | `192.168.1.127` |
| **Sales** | `192.168.1.128/26` | `192.168.1.129` – `192.168.1.190` | `192.168.1.191` |
| **Operations** | `192.168.1.192/26` | `192.168.1.193` – `192.168.1.254` | `192.168.1.255` |

Zero overlap, complete broadcast isolation, and optimal resource utilization.

---

## The Rule of Thumb for Your Next Exam or Interview

Whenever you need to calculate subnets quickly in your head:
1. Identify the number of hosts required.
2. Find the smallest power of 2 that satisfies: $2^h - 2 \ge \text{required hosts}$.
3. Your CIDR prefix will be $32 - h$.
4. Your block size is always $2^h$.

Next time someone tells you subnetting is hard, remember it's just cutting a pie into powers of two.
