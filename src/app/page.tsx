import Link from "next/link";
import Footer from "@/components/Footer";

const services = [
  {
    number: "01",
    name: "Hair Styling",
    description: "Signature cuts, styling and beautiful finishing touches.",
    icon: "✦",
  },
  {
    number: "02",
    name: "Skin & Facial",
    description: "Gentle treatments that help your natural glow shine.",
    icon: "❋",
  },
  {
    number: "03",
    name: "Nail Care",
    description: "Thoughtful details, elegant finishes and everyday luxury.",
    icon: "✳",
  },
  {
    number: "04",
    name: "Makeup",
    description: "Beautiful looks for special days and every celebration.",
    icon: "✧",
  },
];

export default function Home() {
  return (
    <>
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-image" aria-hidden="true" />
          <div className="hero-shade" aria-hidden="true" />
          <div className="container hero-content">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="eyebrow-line" /> A little luxury, just for you
              </p>
              <h1 id="hero-title">
                Your Beauty.
                <br />
                <em>Our Passion.</em>
              </h1>
              <div className="short-line" />
              <p className="hero-description">
                Discover a world of effortless elegance, expert care, and
                beautiful moments made just for you.
              </p>
              <Link href="/services" className="button button-hero">
                Explore Our Services <span aria-hidden="true">↗</span>
              </Link>
              <p className="hero-caption">BEAUTY • WELLNESS • SELF-CARE</p>
            </div>
          </div>
          <div className="hero-side-note">THE ART OF FEELING BEAUTIFUL</div>
        </section>
        <section className="intro section container" id="about">
          <div>
            <p className="eyebrow">WELCOME TO SALONBOOK</p>
            <h2>
              Where beauty meets <em>serenity.</em>
            </h2>
          </div>
          <div>
            <p>
              We believe that taking time for yourself is never a luxury — it is
              essential. Discover exceptional salon services, caring
              professionals, and an experience designed around you.
            </p>
            <Link className="text-link" href="/services">
              Discover our services <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
        <section className="services-section section" id="services">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">OUR SPECIALTIES</p>
                <h2>
                  Beautifully <em>you.</em>
                </h2>
              </div>
              <Link href="/services" className="text-link">
                View all services <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="services-grid">
              {services.map((service) => (
                <Link
                  href="/services"
                  className="service-card"
                  key={service.number}
                >
                  <div className="service-top">
                    <span>{service.number} / 04</span>
                    <span className="service-icon">{service.icon}</span>
                  </div>
                  <div>
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                  </div>
                  <span className="service-arrow" aria-hidden="true">
                    ↗
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="quote-section" id="gallery">
          <div className="container">
            <p className="eyebrow">THE SALONBOOK EXPERIENCE</p>
            <h2>
              “A little self-care goes <em>a long way.</em>”
            </h2>
            <p>Pause. Refresh. Feel like yourself again.</p>
            <Link href="/services" className="button">
              Make an Appointment <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
        <section className="closing section container">
          <p className="eyebrow">YOUR MOMENT STARTS HERE</p>
          <h2>
            Ready for a little <em>glow?</em>
          </h2>
          <p>Explore our services and find the perfect appointment for you.</p>
          <Link href="/services" className="button">
            Book Your Visit <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
