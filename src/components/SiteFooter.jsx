import { assetPath } from '../utils/assetPath';

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__socials" aria-label="CUPI social links">
          <a
            href="https://github.com/Cornell-Physical-Intelligence"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <img src={assetPath('icons/github.svg')} alt="GitHub" />
          </a>
          <a
            href="https://www.instagram.com/cornellphysicalintelligence/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <img src={assetPath('icons/instagram.svg')} alt="Instagram" />
          </a>
          <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <img src={assetPath('icons/linkedin.png')} alt="LinkedIn" />
          </a>
        </div>

        <div className="site-footer__copy">
          <p>This organization is a registered student organization of Cornell University.</p>
          <p>
            Equal Education and Employment:{' '}
            <a
              href="https://hr.cornell.edu/about/workplace-rights/equal-education-and-employment"
              target="_blank"
              rel="noreferrer"
            >
              https://hr.cornell.edu/about/workplace-rights/equal-education-and-employment
            </a>
          </p>
          <p>
            For Questions &amp; Sponsorship Inquiries:&nbsp;
            <a href="mailto:cuphysicalintelligence@cornell.org">cuphysicalintelligence@cornell.org</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
