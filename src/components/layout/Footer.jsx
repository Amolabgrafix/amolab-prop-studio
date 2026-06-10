export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-2xl font-bold text-purple-400">
              Amolab Prop Studio
            </h3>

            <p className="mt-4 text-slate-300">
              Connecting buyers, sellers, landlords, tenants and agents
              through a trusted real estate platform.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>

            <ul className="space-y-2 text-slate-300">
              <li>Home</li>
              <li>Properties</li>
              <li>Buy</li>
              <li>Rent</li>
              <li>Agents</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>

            <ul className="space-y-2 text-slate-300">
              <li>Property Sales</li>
              <li>Property Rentals</li>
              <li>Property Marketing</li>
              <li>Graphic Design</li>
              <li>Printing Services</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>

            <ul className="space-y-2 text-slate-300">
              <li>34, Cemetery Street, Ebute Metta, Lagos, Nigeria</li>
              <li>amolabgrafix2023@gmail.com</li>
              <li>+234 8020 797 481</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-10 pt-6 text-center text-slate-400">
          © 2026 Amolab Prop Studio. All rights reserved.
        </div>
      </div>
    </footer>
  );
}