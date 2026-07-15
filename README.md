# NexusFlow

NexusFlow is a self-hosted, scalable workflow automation engine and integration platform. Designed as an open-source alternative to commercial platforms, it enables developers and teams to build, manage, and monitor complex automated workflows visually.

## Features

- **Visual Workflow Builder**: An intuitive, node-based drag-and-drop canvas for designing automation sequences.
- **Trigger Mechanisms**: Support for Webhook triggers (REST) and Cron-based scheduling.
- **Built-in Actions**: Natively interact with external APIs, manipulate data, branch logic, and trigger automated emails.
- **Custom Code Execution**: Run custom JavaScript within workflows for complex data transformation and logic.
- **Dynamic Interpolation**: Pass data between steps using a double-brace syntax (e.g., `{{trigger.body.email}}`).
- **Data Store CMS**: A built-in, NoSQL-like document store designed for rapid data capture and persistent workflow state.
- **Execution History & Replay**: Detailed, step-by-step JSON logs for every workflow run, coupled with one-click payload replay for failed executions.
- **Multi-Tenant Workspaces**: Role-based access control, allowing teams to collaborate in isolated workspace environments.
- **High Performance Background Processing**: Asynchronous workflow execution powered by Redis and BullMQ.

## Architecture & Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Zustand (State Management)
- React Flow (Node Canvas)
- Lucide React (Icons)

**Backend:**
- Node.js & Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis & BullMQ (Background Workers)
- Socket.io (Real-time Logs & UI Updates)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Redis

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BHuvaneshvar933/NexusFlow.git
   cd NexusFlow
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   - Configure your `.env` file with your `DATABASE_URL`, `REDIS_URL`, and `JWT_SECRET`.
   - Run database migrations:
     ```bash
     npx prisma db push
     npx prisma generate
     ```
   - Start the backend server:
     ```bash
     npm run dev
     ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```
   - Start the frontend development server:
     ```bash
     npm run dev
     ```

## Project Structure

The project is structured into two primary directories:

- `/frontend`: Contains the React application, React Flow canvas, and UI components.
- `/backend`: Contains the Express server, Prisma schema, API controllers, and BullMQ worker processors.

## Recent Updates

- **Data Store CMS**: Introduced a fully functional UI and backend module to view and manage data captured by workflows.
- **Execution Replay**: Added the ability to manually replay failed webhook or manual executions using the original trigger payload.

## License

This project is licensed under the MIT License.
