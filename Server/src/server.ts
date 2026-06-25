import app from '@/app.js';
import connectDB from '@/config/db.js';
import env from '@/config/env.js';
import { SHUTDOWN_TIMEOUT_MS } from '@/utils/constants.js';
import mongoose from 'mongoose';
import type { Server } from 'node:http';

const port = env.PORT;

let server: Server;
let hasError = false;

// ─── Graceful Shutdown ───
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);

  // Force shutdown safety net — if graceful shutdown hangs
  // (e.g., a request never finishes, DB close hangs),
  // force exit after the timeout so the process doesn't hang forever.
  // Process managers (PM2, Docker, K8s) will restart us.
  const forceTimer = setTimeout(() => {
    console.error('⚠️  Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  // Don't let this timer keep the event loop alive if everything
  // else finishes cleanly before the timeout.
  forceTimer.unref();

  // Step 1: Stop accepting new connections, wait for in-flight requests
  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close(err => (err ? reject(err) : resolve()));
      });
      console.log('   ✓ HTTP server closed');
    }
  } catch (err) {
    console.error('   ✗ Error closing HTTP server:', err);
    hasError = true;
  }

  // Step 2: Close database connection
  try {
    await mongoose.connection.close();
    console.log('   ✓ MongoDB connection closed');
  } catch (err) {
    console.error('   ✗ Error closing MongoDB:', err);
    hasError = true;
  }

  console.log('👋 Shutdown complete.');
  process.exit(hasError ? 1 : 0);
}

// ═══════════════════════════════════════════════════════════
// Process-level error handlers — registered BEFORE startServer()
// so they can catch startup errors too.
// ═══════════════════════════════════════════════════════════

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason: unknown) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

function handleServerError(error: NodeJS.ErrnoException) {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use`);
  } else if (error.code === 'EACCES') {
    console.error(`❌ Port ${port} requires elevated privileges`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
}

// ─── Start Server ───
async function startServer(): Promise<void> {
  try {
    await connectDB();

    server = app.listen(port, () => {
      console.log(
        `✅ Server running in ${env.NODE_ENV} mode at http://localhost:${port}`,
      );
    });

    // Server-level error handler — catches errors on the server
    // object itself (not route errors). These are emitted as events,
    // so try-catch can't catch them.
    server.on('error', handleServerError);

    // ─── Connection Timeouts ───
    // Production setup: Client → Nginx/ALB (60s keep-alive) → Node.js
    //
    // Problem without these:
    //   Node default keepAliveTimeout = 5s
    //   Nginx default keep-alive     = 60s
    //   → Node closes connection after 5s
    //   → Nginx thinks connection is still alive
    //   → Nginx sends request on dead connection → 502 Bad Gateway
    //
    // Solution: Node timeout (65s) > Nginx timeout (60s)
    //   → Node always closes AFTER Nginx → no 502 errors
    server.keepAliveTimeout = 65_000;
    server.headersTimeout = 66_000; // must be > keepAliveTimeout (Node.js requirement)
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
