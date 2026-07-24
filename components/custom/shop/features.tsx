import { Zap, Shield, Droplet, Award } from 'lucide-react'

export function KoaFeatures() {
  const features = [
    {
      icon: Zap,
      title: 'High Performance',
      description: 'Engineered for maximum output and endurance in every activity',
    },
    {
      icon: Shield,
      title: 'Durable Quality',
      description: 'Built to last through intense training and everyday wear',
    },
    {
      icon: Droplet,
      title: 'Moisture Wicking',
      description: 'Advanced fabric technology keeps you dry and comfortable',
    },
    {
      icon: Award,
      title: 'Warrior Tested',
      description: 'Trusted by athletes and fitness enthusiasts worldwide',
    },
  ]

  return (
    <section className="py-20 px-4 bg-muted">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3 font-medium">
            Built for warriors
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Why Choose KOA
          </h2>
          <p className="text-base text-muted-foreground">
            Excellence in every detail
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-card p-8 rounded-xl border border-border text-center transition-all duration-300 hover:shadow-lg hover:border-primary/20 group"
              >
                <div className="flex justify-center mb-5">
                  <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
