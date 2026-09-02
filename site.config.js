/**
 * Coco Villa – Site Configuration
 * ================================
 * Edit this file to update pricing and site-wide settings.
 * No code changes required – just save and deploy.
 */

const SITE_CONFIG = {

    /**
     * Nightly Rate Plans
     * ------------------
     * Each entry appears as a row in the "Nightly Rates" table
     * on the Stay section of the homepage.
     *
     * Fields:
     *  label      - Rate plan name shown to guests
     *  price      - Nightly price in USD (number)
     *  badge      - Optional short label inside a pill chip (null to hide)
     *  badgeType  - Visual style: "default" | "value" | "flex"
     *  highlight  - true = green-tinted row (use for the best-value pick)
     */
    rates: [
        {
            label: 'Standard Rate',
            price: 35.,
            badge: null,
            badgeType: 'default',
            highlight: false,
        },
        {
            label: 'Non-Refundable',
            price: 31,
            badge: 'Best Value',
            badgeType: 'value',
            highlight: true,
        },
        {
            label: 'Weekly Rate',
            price: 29,
            badge: '7+ Nights',
            badgeType: 'default',
            highlight: false,
        },
        {
            label: 'Fully Flexible',
            price: 38,
            badge: 'Free Cancel',
            badgeType: 'flex',
            highlight: false,
        },
    ],

    /**
     * Rate Table Footer Note
     * ----------------------
     * Shown beneath the rate rows. Supports plain text only.
     * The WhatsApp link is automatically appended using the phone number below.
     */
    rateTableNote: 'Message us on WhatsApp for the best direct rate.',

    /**
     * WhatsApp Contact Number
     * -----------------------
     * International format without the leading '+'.
     * Example: '94712566198' for +94 712 566 198
     */
    whatsappNumber: '94712566198',

};
