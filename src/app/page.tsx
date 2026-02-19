"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/common/Button';
import styles from './page.module.css';

export default function Home() {
  const features = [
    { title: "Smart Engine", desc: "Real-time accuracy tracking, WPM analysis, and adaptive difficulty scaling.", icon: "⚡" },
    { title: "AI Coach", desc: "Personalized lessons that identify weak keys and optimize your practice routine.", icon: "🤖" },
    { title: "Multiplayer", desc: "Race against friends or global competitors in real-time typing battles.", icon: "🌍" },
    { title: "Gamified Learning", desc: "Earn XP, unlock themes, and climb the ranks in our rpg-style progression system.", icon: "🎮" },
  ];

  return (
    <main className={styles.main}>
      <div className={styles.backgroundGlow} />

      <div className={styles.hero}>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Master Typing at the <span style={{ color: 'var(--accent-primary)' }}>Speed of Thought</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          The world's most advanced AI-powered typing ecosystem.
          Compete, learn, and evolve your skills with futuristic precision.
        </motion.p>

        <motion.div
          className={styles.cta}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link href="/typing-test">
            <Button size="lg" variant="primary">Start Typing Now</Button>
          </Link>
          <Link href="/leaderboard">
            <Button size="lg" variant="outline">View Leaderboard</Button>
          </Link>
        </motion.div>
      </div>

      <section className={styles.features}>
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className={styles.featureCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
          >
            <div className={styles.featureTitle}>
              <span style={{ marginRight: '0.5rem' }}>{feature.icon}</span>
              {feature.title}
            </div>
            <p className={styles.featureDesc}>{feature.desc}</p>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
