---
# ─────────────────────────────────────────────────────────────
# BLOG FRONTMATTER (Metadata)
# ─────────────────────────────────────────────────────────────
title: "implmenting nslookup"
description: "A short 1-2 sentence description explaining how DNS queries work, UDP sockets, and parsing raw DNS wire format packets."
date: "Oct 4, 2026"
tags: ["Networking", "DNS", "C", "Sockets", "nslookup"]
readTime: "5 min read"
author: "Garvit Singla"

githubUrl: "https://github.com/garvittsingla/nslookup"



---

There is a very famous inteview question, what happens when you type google.com in your search bar
The first and the most obvious jargon that comes to mind is the unmighty DNS. So i just thought about it and read something about it , and it just open my brain wires of the concepts of networking which made me choose this.

I started with the concept of DNS and how it works.
then came to know about UNIX utilities like `nslookup` and `dig`.

This blog is whole about my learning and building nslookup from scratch.



---

## 1. Intro and understanding (10 sept 2026)

I started with reading about DNS headers and the DNS query process.

> DNS is the Domain Name System, a hierarchical naming system for computers and services on the Internet.

DNS is based on UDP sockets but , if there is a big DNS query, it is split into multiple packets and transmitted with the help of TCP.

## 2. Understanding DNS query process (11 sept 2026)

Next thing was to understand what is exactly DNS query process.
For that we have to understand **Types of DNS servers**.

- **Root DNS servers**: The first level of DNS servers that are responsible for resolving the top-level domain (TLD) names.
- **TLD DNS servers**: The second level of DNS servers that are responsible for resolving the second-level domain (SLD) names.
- **Authoritative DNS servers**: The third level of DNS servers that are responsible for resolving the domain names.
- **Recursive DNS servers**: The fourth level of DNS servers that are responsible for resolving the domain names.

if you want more detail refer : [Cloudflare docs](https://www.cloudflare.com/learning/dns/dns-server-types/)

So we are just quering the Recursive DNS server and not recursively finding the authoritative DNS servers.
some of them are google's DNS `8.8.8.8` and cloudflare's DNS `1.1.1.1` or provided by your ISP.

## 3. Making DNS request yourself (13 sept 2026)

I used nslookup and wireshark to actually make DNS requests and understand the process.
![query](https://github.com/garvittsingla/nslookup/raw/main/docs/dnsPacketStructure.png)



