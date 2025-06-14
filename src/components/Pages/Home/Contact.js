import "animate.css/animate.min.css";
import WOW from "wow.js";
import { useEffect } from "react";
import './Contact.css';

const Contact = () => {
  useEffect(() => {
    new WOW().init();
  }, []);

  return (
    <>

      <section className="ftco-section contact-section bg-light guide-section" style={{ paddingTop: '30px' }}>
        <div className="container">
          <div className="row mb-5">
            <div className="col-md-12">
              <h2>How to Create "Boat" & Earn Commission</h2>

              <h5>Step 1: Register an Account</h5>
              <p>
                Go to the registration page and sign up for a free account. <br />
                After registering, you will start at 1-star level, earning <strong>1% revenue</strong> from your created "Boat".
              </p>

              <h5>Step 2: Create "Boat" to Increase Your Star Level and Earnings</h5>
              <ul>
                <li>Create 5 Boats → Upgrade to 2 stars → Earn 2% revenue</li>
                <li>Create 10 Boats → Upgrade to 3 stars → Earn 3% revenue</li>
                <li>Create 20 Boats → Upgrade to 4 stars → Earn 4% revenue</li>
                <li>Create 50 Boats → Upgrade to 5 stars → Earn 5% revenue</li>
              </ul>

              <h5>Step 3: Share to Attract Customers</h5>
              <p>
                After creating a "Boat", share it on social media platforms (Facebook, TikTok, Telegram, etc...). <br />
                The more people join your "Boat", the more revenue you earn!
              </p>

              <h5>Rules</h5>

              <h6>1. Revenue Payout</h6>
              <p>
                All revenue will be paid out on the <strong>20th of each month</strong>.
              </p>

              <h6>2. No Cheating Allowed</h6>
              <p>
                Any form of fraud or manipulation will result in <strong>account termination and forfeiture of all earnings</strong>.
              </p>

              <h6>3. 5-Star Responsibility</h6>
              <p>
                When you reach 5 stars, your account becomes a <strong>"Boat" referee</strong>. <br />
                You are responsible for monitoring and evaluating the outcome of your created "Boat". <br />
                ⚠️ <strong>Your judgment must be accurate.</strong> False or biased results may lead to account suspension.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
