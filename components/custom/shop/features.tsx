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
    <section className="py-16 px-4 bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-koa-black mb-4">
            Why Choose KOA
          </h2>
          <p className="text-lg text-[#2A2A2A]">
            Excellence in every detail
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-lg border border-[#CCCCCC] text-center hover:shadow-lg transition"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-[#3D79BE] rounded-lg">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-koa-black mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#2A2A2A]">
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
