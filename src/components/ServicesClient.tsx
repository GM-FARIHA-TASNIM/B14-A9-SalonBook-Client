"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  API_URL,
  type ApiService,
  type ServiceCategory,
} from "@/lib/salon-api";

type CategoryFilter = "All Services" | ServiceCategory;
type SortOption = "default" | "low" | "high" | "name";

const categories: CategoryFilter[] = [
  "All Services",
  "Hair",
  "Facial",
  "Nails",
  "Makeup",
  "Spa",
];

export default function ServicesClient() {
  const [services, setServices] = useState<ApiService[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All Services");
  const [sort, setSort] = useState<SortOption>("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadServices() {
      try {
        const response = await fetch(`${API_URL}/api/services`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load services");
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error("Invalid services response");
        }

        setServices(result.data);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error ? err.message : "Unable to load services",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadServices();

    return () => controller.abort();
  }, []);

  const filteredServices = useMemo(() => {
    const result = services.filter((service) => {
      const query = search.toLowerCase();

      const matchesSearch =
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query);

      const matchesCategory =
        category === "All Services" || service.category === category;

      return matchesSearch && matchesCategory;
    });

    if (sort === "low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return result;
  }, [services, search, category, sort]);

  return (
    <main className="min-h-screen bg-[#FFFCF9] text-[#342D2C]">
      <section className="bg-[#F8F0EB] px-6 py-20 text-center md:py-28">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#A75F66]">
          The SalonBook Experience
        </p>

        <h1 className="font-serif text-5xl font-normal md:text-7xl">
          Our Services
        </h1>

        <div className="mx-auto my-7 h-px w-16 bg-[#B8797D]" />

        <p className="mx-auto max-w-xl text-sm leading-7 text-[#756A67] md:text-base">
          Discover thoughtfully curated beauty and wellness treatments designed
          to make every visit feel extraordinary.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#A75F66]">
            Indulge in Beauty
          </p>

          <h2 className="font-serif text-3xl md:text-4xl">
            Find Your Perfect Treatment
          </h2>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for a treatment..."
            aria-label="Search services"
            className="w-full rounded-sm border border-[#E7DAD3] bg-white px-5 py-3.5 text-sm outline-none focus:border-[#A75F66] md:max-w-md"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            aria-label="Sort services"
            className="rounded-sm border border-[#E7DAD3] bg-white px-5 py-3.5 text-sm outline-none focus:border-[#A75F66]"
          >
            <option value="default">Sort By: Featured</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={`rounded-sm border px-5 py-2.5 text-xs font-medium tracking-wide transition-colors ${
                category === item
                  ? "border-[#984E59] bg-[#984E59] text-white"
                  : "border-[#E6D7D1] bg-white text-[#665B58] hover:border-[#984E59]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {loading && (
          <p className="py-16 text-center text-[#81736E]">
            Loading our treatments...
          </p>
        )}

        {error && (
          <p role="alert" className="py-12 text-center text-[#984E59]">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <p className="mb-6 text-sm text-[#81736E]">
              Showing {filteredServices.length} treatments
            </p>

            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map((service) => (
                  <article
                    key={service._id}
                    className="overflow-hidden border border-[#F0E6E0] bg-white"
                  >
                    <div className="relative h-64 overflow-hidden bg-[#F5EBE6]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={service.image}
                        alt={service.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />

                      <span className="absolute left-4 top-4 bg-[#FFFCF9] px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-[#9A5861]">
                        {service.category}
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="mb-3 font-serif text-2xl">
                        {service.name}
                      </h3>

                      <p className="mb-5 min-h-12 text-sm leading-6 text-[#81736E]">
                        {service.description}
                      </p>

                      <div className="mb-6 flex items-center justify-between border-t border-[#F0E6E0] pt-5">
                        <span className="text-lg font-semibold text-[#984E59]">
                          ৳{service.price.toLocaleString("en-BD")}
                        </span>

                        <span className="text-xs text-[#81736E]">
                          {service.duration} minutes
                        </span>
                      </div>

                      <Link
                        href={`/services/${service._id}`}
                        className="block bg-[#984E59] px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#803F49]"
                      >
                        View Details
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="border border-[#E7DAD3] bg-[#F8F0EB] px-6 py-16 text-center">
                <h3 className="mb-3 font-serif text-2xl">
                  No Treatments Found
                </h3>

                <p className="mb-6 text-sm text-[#81736E]">
                  Try another search or select a different category.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All Services");
                    setSort("default");
                  }}
                  className="bg-[#984E59] px-6 py-3 text-sm text-white"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section className="bg-[#F8F0EB] px-6 py-16 text-center md:py-20">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#A75F66]">
          Your Moment of Luxury
        </p>

        <h2 className="mb-5 font-serif text-3xl md:text-5xl">
          Beauty Begins Here
        </h2>

        <p className="mx-auto max-w-lg text-sm leading-7 text-[#756A67]">
          Explore our treatments and choose the perfect experience for your next
          salon visit.
        </p>
      </section>
    </main>
  );
}
