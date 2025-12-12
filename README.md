# English Quiz App 🚀

Modern, interactive English learning application built with React Native (Expo) and FastAPI.

## 🌟 Features
- **Vocabulary Quiz:** Learn new words with interactive quizzes.
- **Leaderboard:** Compete with others and see global rankings.
- **Statistics:** Track your level, total score, and ranking.
- **Daily Goals:** Set and achieve daily practice targets.
- **Authentication:** Secure sign-up/sign-in powered by Clerk.

## 🛠 Tech Stack
- **Frontend:** React Native, Expo, NativeWind (Tailwind), Clerk Expo
- **Backend:** Python (FastAPI), SQLModel, PostgreSQL
- **Database:** PostgreSQL

## 🚀 Getting Started

### Prerequisites
- Node.js & npm/pnpm
- Python 3.12+
- Docker & Docker Compose (optional, for easy setup)
- Expo Go app on your phone (for testing)

### 1. Backend Setup

#### Option A: Using Docker (Recommended)
Run the backend and database with a single command:
```bash
docker-compose up -d --build
```
The API will be available at `http://localhost:8000`.

#### Option B: Manual Setup
1. Navigate to backend: `cd backend`
2. Create virtual env: `python3 -m venv venv && source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Set `.env` variables (see `backend/README.md`).
5. Run server: `uvicorn main:app --reload`

### 2. Frontend Setup
1. Navigate to frontend: `cd frontend`
2. Install dependencies: `pnpm install`
3. Set environment variables:
   Create `.env` file and add your Clerk Key:
   ```
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```
4. Start the app:
   ```bash
   npx expo start
   ```
5. Scan the QR code with Expo Go or run on Emulator.

## 📦 Deployment

### Backend (Render / Railway / AWS)
1. **Docker:** The project includes a `Dockerfile`. You can deploy this image to any container platform (Render, Railway, AWS ECS, DigitalOcean App Platform).
2. **Environment Variables:** Make sure to set `SQLMODEL_DATABASE_URL` and `CLERK_ISSUER_URL` in your production environment.

### Frontend (Expo / App Stores)
1. **Configure EAS:**
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```
2. **Build for Android/iOS:**
   ```bash
   eas build --platform android
   eas build --platform ios
   ```
3. **OTA Updates:**
   ```bash
   eas update
   ```

## 📂 Project Structure
- `backend/`: FastAPI application, API endpoints, database models.
- `frontend/`: Expo React Native application, UI screens, components.
- `docker-compose.yml`: Local development orchestration.

## 📝 License
This project is open source and available under the MIT License.