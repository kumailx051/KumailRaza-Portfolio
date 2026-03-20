const projects = {
  id: "05",
  label: "Projects",
  title: "Featured Projects",
  sectionTitle: "Featured Projects",
  text: "Explore my featured mobile projects with live previews and production-focused architecture.",
  tags: ["Flutter", "Firebase", "Python", "Dart"],
  highlights: [
    "Shifters Mobile App — secure household shifting platform",
    "RAABTA — real-time communication with secure authentication",
    "Gupshup — interactive chat with modern real-time messaging UX",
    "Transport App — real-time booking and driver management system",
    "QuickHelp — service platform for domestic worker hiring"
  ],
  websitesSection: {
    description: "A dedicated stream for website projects focused on clean UX, responsive interfaces, and production-ready front-end architecture.",
    points: [
      "Responsive website experiences for desktop and mobile",
      "Fast and accessible UI implementation",
      "Scalable component-based front-end structure"
    ],
    websiteProject: {
      name: "REZAZ",
      description: "A modern e-commerce website with elegant design and user-friendly interface. Built with responsive design principles for optimal user experience.",
      technologies: ["Bootstrap", "HTML", "CSS", "JavaScript"],
      appUrl: "https://kumailx051.github.io/ECOMMERCE-WEBSITE/"
    },
    websiteProject2: {
      name: "TICTACTOE Game",
      description: "An interactive Tic Tac Toe game built with React. Features modern UI design, smooth animations, and engaging gameplay experience.",
      technologies: ["React"],
      appUrl: "https://kumailx051.github.io/TicTacToe-ReactApp/"
    },
    websiteProject3: {
      name: "FreelanceNest",
      description: "FreelanceNest is a role-based freelancing platform frontend built with React, TypeScript, and Vite. It includes dedicated experiences for clients, freelancers, and admins, with core workflows for hiring, messaging, gigs, proposals, project workspaces, escrow-style payments, and platform moderation.",
      technologies: [
        "React 19 + TypeScript",
        "Vite 7",
        "React Router",
        "Firebase (auth/data integrations)",
        "Stripe (payment integration)",
        "Zoom Meeting SDK (meeting workflows)",
        "Tailwind CSS + PostCSS"
      ],
      appUrl: "https://kumailx051.github.io/freelancenestLive/"
    }
  },
  mlSection: {
    title: "Machine Learning Projects",
    subtitle: "Applied ML systems focused on OCR, identity intelligence, and multilingual text classification.",
    projects: [
      {
        name: "CNIC Information Extraction & Verification",
        description: "A machine learning model trained on a dataset of 2,500 Pakistani Computerized National Identity Cards (CNIC), aimed at automated information extraction and identity verification.",
        points: [
          "Processes CNIC images to detect and parse structured fields like personal details and identification numbers.",
          "Built for practical KYC workflows, onboarding automation, and document digitization.",
          "Supports scalable identity-document handling for real-world verification pipelines."
        ],
        githubUrl: "https://github.com/kumailx051/cnic"
      },
      {
        name: "Spam Detection Model",
        description: "Spam Detection Model | Python, scikit-learn, TF-IDF, Machine Learning, Flask.",
        points: [
          "Classifies text messages as spam or legitimate for both English and Roman Urdu.",
          "Uses separate TF-IDF powered models and exposes a Flask REST API for real-time predictions.",
          "Optimized for multilingual input and large-scale message classification scenarios."
        ],
        githubUrl: "https://github.com/kumailx051/spamModel"
      }
    ]
  },
  appUrl: "https://kumailx051.github.io/Shiffters/",
  projectsList: [
    {
      name: "Shifters Mobile App",
      stack: "Flutter, Firebase, Python",
      appUrl: "https://kumailx051.github.io/Shiffters/",
      leftTitle: "Core Build",
      leftPoints: [
        "Created an FYP mobile app for secure household item shifting.",
        "Built scan-based digital inventory creation workflow.",
        "Implemented driver verification at delivery checkpoints."
      ],
      rightTitle: "Impact",
      rightPoints: [
        "Deployed real-time tracking and AI-based missing-item alerts during offloading.",
        "Secured 3rd position in the NUML Nexus FYP National Competition.",
        "Improved trust with scan-based delivery verification flow."
      ]
    },
    {
      name: "RAABTA",
      stack: "Flutter, Dart, Firebase",
      appUrl: "https://kumailx051.github.io/Raabta/",
      description: "A comprehensive communication platform with real-time messaging and secure authentication. Features modern UI design and seamless user experience.",
      rightTitle: "Project Details",
      rightPoints: [
        "Technologies Used: Flutter, Dart, Firebase",
        "Test Profile — Email: kumail@gmail.com",
        "Test Profile — Password: kumail123"
      ]
    },
    {
      name: "Gupshup",
      stack: "Flutter, Dart, Firebase",
      appUrl: "https://kumailx051.github.io/Gupshup/",
      description: "An interactive chat application with modern design and real-time communication features. Built for seamless messaging experience.",
      leftTitle: "Project Details",
      leftPoints: [
        "Technologies Used: Flutter, Dart, Firebase",
        "Test Profile — Email: kumail@gmail.com",
        "Test Profile — Password: kumail123"
      ]
    },
    {
      name: "Transport App",
      stack: "Flutter, Dart, Firebase",
      appUrl: "https://kumailx051.github.io/TransportApp",
      description: "A comprehensive transportation management system with user and driver interfaces. Features real-time tracking, booking management, and secure authentication.",
      leftTitle: "Core Features",
      leftPoints: [
        "Technologies Used: Flutter, Dart, Firebase",
        "User and Driver interfaces with secure authentication",
        "Real-time tracking and booking management flows"
      ],
      rightTitle: "Test Profiles",
      rightPoints: [
        "User — Email: user@gmail.com | Password: user123",
        "Driver — Email: driver@gmail.com | Password: driver123",
        "Vehicle: driver"
      ]
    },
    {
      name: "QuickHelp",
      stack: "React Native, Firebase, Python",
      appUrl: "https://kumailx051.github.io/QuickHelp/",
      rightTitle: "Project Details",
      rightPoints: [
        "A service platform connecting users with domestic workers.",
        "Features intuitive design, job management, and user-friendly interface.",
        "Technologies Used: React Native, Firebase, Python"
      ]
    }
  ],
  color: "#a58bff",
  stats: [{ v: "05", l: "Featured Apps" }, { v: "Live", l: "Running Demos" }, { v: "3rd", l: "National Rank" }]
};

export default projects;
