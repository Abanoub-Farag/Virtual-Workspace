# Virtual Workspace 🚀

Welcome to **Virtual Workspace** – the modern, centralized hub designed for seamless collaboration and productivity. 

## 🌟 The Vision

In a world where digital collaboration is essential, **Virtual Workspace** bridges the gap by providing a cohesive, real-time environment. It is a virtual space where your presence matters, your tasks are organized, and your favorite spaces are just a click away.

## 🎯 Target Audience

- **Students & Study Groups**: An ideal environment for students who want to study alongside peers in real-time. Join dedicated study rooms to share resources, keep track of assignments with the task manager, and foster a collaborative learning atmosphere.
- **Remote Workers & Freelancers**: Built for professionals seeking motivation and productivity. Work alongside others in virtual spaces to simulate the energy of a bustling office, helping to maintain focus and overcome the isolation of remote work.
- **Productivity Enthusiasts**: Anyone looking for a structured, distraction-free digital zone to organize their day, complete tasks, and track their progress alongside like-minded individuals.

## ✨ Key Features

- **Personalized Profiles**: Set up your digital identity.
- **Virtual Rooms**: Create or join dynamic rooms. Mark your most-visited rooms as favorites for quick access.
- **Real-Time Presence**: See who is currently active in a room with a robust heartbeat and presence system.
- **Task Management**: Keep track of what needs to be done, directly tied to your workflow.
- **Beautiful, Vibe-Coded UI**: An interface that doesn't just work—it feels *good* to use.

## 📂 Project Structure & Architecture Overview

This project is structured as a full-stack application, split into two main domains. The architecture relies on stateless authentication via JWTs, ensuring horizontal scalability. 

- **[`/backend`](./backend)**: The powerhouse. An enterprise-grade, highly scalable API built with **Java 21, Spring Boot 3, and PostgreSQL**. It handles secure authentication, real-time presence caching via **Redis**, and API rate limiting using **Bucket4j**. 
  👉 [Read the Backend Documentation](./backend/README.md)
- **[`/frontend`](./frontend)**: The face of the application. A stunning, **Server-Side Rendered (SSR) Angular 22** web application focused on delivering a premium, "vibe-coded" user experience with modern CSS and fluid animations. 
  👉 [Read the Frontend Documentation](./frontend/README.md)
