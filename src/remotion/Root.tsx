import { Composition, Folder } from 'remotion'
import { EXAMPLES } from './data/examples'
import './fonts'
import { TEMPLATE_LIST } from './templates'
import { FORMATS, FPS, type BettingVideo, type FormatId } from './types'

const formatKey = (id: FormatId) => id.replace(':', 'x')

/**
 * One composition per template per format.
 *
 * Duration comes from `calculateMetadata` rather than a constant, because a
 * five-leg builder genuinely needs longer than a three-leg one — hardcoding it
 * would either clip the slip or leave dead frames at the end.
 */
export const RemotionRoot: React.FC = () => (
  <>
    {TEMPLATE_LIST.map((template) => (
      <Folder key={template.key} name={template.key}>
        {Object.values(FORMATS).map((format) => {
          const example = EXAMPLES[template.id]
          return (
            <Composition
              key={`${template.key}-${formatKey(format.id)}`}
              id={`${template.key}-${formatKey(format.id)}`}
              component={template.component}
              durationInFrames={template.duration(example)}
              fps={FPS}
              width={format.width}
              height={format.height}
              defaultProps={{ data: example }}
              calculateMetadata={({ props }: { props: { data: BettingVideo } }) => ({
                durationInFrames: template.duration(props.data),
              })}
            />
          )
        })}
      </Folder>
    ))}
  </>
)
