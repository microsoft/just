# Sharing Reusable Library Code Across Platforms and Applications

Top technology companies are increasingly able to deliver their software on demand and at a short and regular cadence. To leverage the best of the modern Web technology, the Service Delivery Experience, SDX, effort has been created. So far, many teams have been creating shared components across native platforms and some web platforms with the WebView SDX and React Native SDX approaches. As we have seen, using WebViews (i.e. iframes) is fine for third party Add-in scenarios, but isn't ideal for performance and cannot integrate too well with the underlying applications.

For this reason, we need to rethink about how we need to share code from a Web library team to an Application library team. We will try to describe some problems we must address when designing a solution. We will try to come up with an ideal future and work backwards to outline a roadmap.

## Problems to be Addressed

- iframes are not acceptable in first party scenarios
- no duplicated dependencies between library and app in production
- mono-repo does not scale to the number of libraries and applications
- need fast innerloop to develop library against live dogfood ring application
- need a way to sideload pre-published library to a live dogfood ring application
- SDX definition is too vague
- build tooling must self-upgrading unlike create-react-app or yoeman template

## Core Features

- A SDX CLI tool that is self upgrading and provides a way to build SDX's themselves
- A specialized npm feed just for validated & published SDX's
- Validation scripts inside the SDX CLI tool
- A SDX browser of all the published packages that are blessed and readily usable by applications
- DEEP Integration with existing apps to consume these npm packages in prod mode and dev mode
- Dev mode allows quick innerloop development against live apps in dogfood ring
- Deployed SDX bundles are loadable dynamically by live apps in dogfood ring
