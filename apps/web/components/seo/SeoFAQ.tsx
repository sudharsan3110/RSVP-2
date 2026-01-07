type SeoFAQItem = {
  question: string;
  answer: string;
};

type SeoFAQProps = {
  items: SeoFAQItem[];
};

export default function SeoFAQ({ items }: SeoFAQProps) {
  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-semibold mb-6">
        Frequently Asked Questions
      </h2>

      <div className="space-y-4">
        {items.map((item, index) => (
          <details key={index} className="group rounded-lg border border-gray-200 p-4">
            <summary
              className="
                cursor-pointer 
                list-none 
                font-medium 
                outline-none
                flex 
                items-center 
                justify-between
                focus-visible:ring-2 
                focus-visible:ring-blue-500
              "
            >
              {item.question}

              <span className="ml-4 transition-transform group-open:rotate-180">▼</span>
            </summary>

            <div className="mt-3 text-gray-700 leading-relaxed">{item.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
