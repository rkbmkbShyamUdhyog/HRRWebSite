const COLLECTED = [
  {
    what: 'Information you give us',
    examples: 'Name, email address, phone number, the content of your message',
    when: 'When you email or call us, or use a contact or newsletter form on the site',
  },
  {
    what: 'Technical information',
    examples: 'IP address, browser and device type, pages visited, date and time of visit',
    when: 'Automatically, each time you visit, through our hosting server’s standard logs',
  },
  {
    what: 'Cookies',
    examples: 'Small files that keep the site working',
    when: 'Automatically, when you visit',
  },
];

export default function PrivacyPolicy() {
  return (
    <>
      <p>
        HRR does not sell anything on this website and collects very little personal information. You can browse every
        product without giving us your name, email or phone number; when you click Buy, you leave our site and complete
        your purchase on Amazon.
      </p>

      <h2>1. Who we are</h2>
      <p>
        This website is run by Raj Kumar Biyani, the owner of the HRR® clothing brand. This policy explains what personal
        information we collect through the website, why, and the choices you have. It applies only to this website, not
        to Amazon or any other site we link to.
      </p>
      <ul>
        <li>
          <strong>Address:</strong> 24, Netaji Subhas Road, Liluah, Howrah – 711204, West Bengal, India
        </li>
        <li>
          <strong>Email:</strong> <a href="mailto:shyamudhyog@gmail.com">shyamudhyog@gmail.com</a>
        </li>
        <li>
          <strong>Phone:</strong> <a href="tel:+918240920448">+91 82409 20448</a>
        </li>
      </ul>

      <h2>2. Information we collect</h2>
      <p>We collect only what we need to run the website and reply to you.</p>
      <div className="prose__table">
        <table>
          <thead>
            <tr>
              <th scope="col">What</th>
              <th scope="col">Examples</th>
              <th scope="col">When</th>
            </tr>
          </thead>
          <tbody>
            {COLLECTED.map(({ what, examples, when }) => (
              <tr key={what}>
                <th scope="row">{what}</th>
                <td>{examples}</td>
                <td>{when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        We do not ask for, and the website does not collect, payment card details, bank details, passwords or government
        ID numbers. We do not create customer accounts on this website at present.
      </p>

      <h2>3. How we use your information</h2>
      <p>We use your information only for these purposes:</p>
      <ul>
        <li>To reply to your questions, feedback or business enquiries</li>
        <li>
          To send you news about new collections, but only if you have signed up for it; every email has an unsubscribe
          link
        </li>
        <li>To keep the website working, secure and free from misuse</li>
        <li>To understand which pages and products are popular, so we can improve the site</li>
        <li>To meet our obligations under Indian law, for example if a government authority lawfully asks for information</li>
      </ul>
      <p>
        We process your information on the basis of your consent, which you give when you contact us or sign up, or for
        the legitimate uses allowed under the Digital Personal Data Protection Act, 2023. We do not sell your personal
        information, and we do not use it for any purpose you have not been told about.
      </p>

      <h2>4. Buying on Amazon</h2>
      <p>
        All HRR purchases happen on Amazon, not on this website. When you click a Buy button, you are taken to our product
        listing on Amazon in a new tab.
      </p>
      <p>
        From that point, Amazon collects and handles your information, including your name, address, phone number and
        payment details, under Amazon’s own Privacy Notice. Orders, payments, delivery, returns and refunds are all
        handled by Amazon. We receive from Amazon only the order details a seller needs to fulfil your order, and we use
        them only for that purpose.
      </p>
    </>
  );
}
