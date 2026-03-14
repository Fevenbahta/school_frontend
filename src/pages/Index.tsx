import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Users, Shield, ChevronRight, Sparkles, BarChart3, Clock, ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const features = [
  { icon: BookOpen, title: 'Smart Question Banks', desc: 'Organize questions by subject, difficulty, and type with bulk CSV import.' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track student performance with detailed insights and progress reports.' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Four distinct roles with granular permissions for complete institutional control.' },
  { icon: Clock, title: 'Timed Examinations', desc: 'Auto-timed exams with shuffle options, instant grading, and session tracking.' },
  { icon: Users, title: 'Multi-Tenant', desc: 'Manage multiple schools and institutions from a single super admin dashboard.' },
  { icon: Sparkles, title: 'Modern Interface', desc: 'Beautiful dark/light mode with smooth animations and responsive design.' },
];

const floatingShapes = [
  { className: 'w-72 h-72 bg-primary/8 rounded-full blur-3xl', x: '10%', y: '15%', animY: [-30, 30], duration: 8 },
  { className: 'w-96 h-96 bg-accent/10 rounded-full blur-3xl', x: '70%', y: '10%', animY: [20, -20], duration: 10 },
  { className: 'w-64 h-64 bg-secondary/8 rounded-full blur-3xl', x: '50%', y: '60%', animY: [-25, 25], duration: 7 },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-border"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <span className="text-xl font-bold tracking-tight">ExamPrep</span>
          </div>
          <Button onClick={() => navigate('/login')} size="sm">
            Sign In <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Animated floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingShapes.map((shape, i) => (
            <motion.div
              key={i}
              className={`absolute ${shape.className}`}
              style={{ left: shape.x, top: shape.y }}
              animate={{ y: shape.animY }}
              transition={{ duration: shape.duration, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            />
          ))}
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <motion.span animate={{ rotate: [0, 20, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Sparkles className="w-4 h-4" />
              </motion.span>
              Built for Modern Education
            </span>
          </motion.div>
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
          >
            The Exam Platform
            <br />
            <motion.span
              className="text-primary inline-block"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              Schools Deserve
            </motion.span>
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Create, manage, and deliver exams with a powerful multi-tenant platform
            designed for schools, universities, and training institutions.
          </motion.p>
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" className="px-8 text-base group" onClick={() => navigate('/login')}>
                Get Started
                <motion.span className="ml-1 inline-block" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" variant="outline" className="px-8 text-base" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                Explore Features
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border bg-muted/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6 text-center">
          {[
            { val: '10k+', label: 'Students' },
            { val: '500+', label: 'Institutions' },
            { val: '50k+', label: 'Exams Delivered' },
            { val: '99.9%', label: 'Uptime' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="text-3xl md:text-4xl font-bold text-primary">{s.val}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">A complete exam management ecosystem from question creation to result analytics.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, boxShadow: '0 20px 40px -15px hsl(var(--primary) / 0.12)' }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors duration-300"
              >
                <motion.div
                  className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                  whileHover={{ rotate: 10 }}
                >
                  <f.icon className="w-6 h-6 text-primary" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-24 px-6 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Designed for Every Role</h2>
            <p className="text-muted-foreground text-lg">Tailored dashboards and workflows for every user in your institution.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { role: 'Super Admin', desc: 'Manage tenants, schools, and platform-wide students.', color: 'bg-primary' },
              { role: 'School Admin', desc: 'Organize departments, sections, subjects, and teachers.', color: 'bg-secondary' },
              { role: 'Teacher', desc: 'Build question banks, create and publish exams.', color: 'bg-accent' },
              { role: 'Student', desc: 'Take exams, track results, and monitor progress.', color: 'bg-muted' },
            ].map((r, i) => (
              <motion.div
                key={r.role}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="p-6 rounded-2xl border border-border bg-card text-center"
              >
                <motion.div
                  className={`w-14 h-14 rounded-full ${r.color}/10 flex items-center justify-center mx-auto mb-4`}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, delay: i * 0.5, repeat: Infinity }}
                >
                  <Users className="w-7 h-7 text-foreground/70" />
                </motion.div>
                <h3 className="font-semibold text-lg mb-2">{r.role}</h3>
                <p className="text-muted-foreground text-sm">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0.5 }}
        >
          <motion.div
            className="absolute w-80 h-80 bg-primary/5 rounded-full blur-3xl"
            style={{ left: '20%', top: '20%' }}
            animate={{ x: [-20, 20], y: [-15, 15] }}
            transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse' }}
          />
          <motion.div
            className="absolute w-64 h-64 bg-accent/8 rounded-full blur-3xl"
            style={{ right: '15%', bottom: '10%' }}
            animate={{ x: [15, -15], y: [10, -10] }}
            transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}
          />
        </motion.div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Exams?</h2>
            <p className="text-muted-foreground text-lg mb-8">Join hundreds of institutions already using ExamPrep to streamline their examination process.</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" className="px-10 text-base" onClick={() => navigate('/login')}>
                Start Now <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span>ExamPrep © {new Date().getFullYear()}</span>
          </div>
          <span>Built for modern education</span>
        </div>
      </footer>
    </div>
  );
}
